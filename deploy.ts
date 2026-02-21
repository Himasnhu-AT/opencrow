import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname.endsWith("dist")
  ? path.resolve(__dirname, "..")
  : __dirname;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("SIGINT", () => {
  console.log("\n🚫 Deployment cancelled.");
  process.exit(0);
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

const run = (cmd: string, silent = false) => {
  if (!silent) console.log(`\n> ${cmd}`);
  try {
    return execSync(cmd, {
      stdio: silent ? "pipe" : "inherit",
      encoding: "utf-8",
    });
  } catch (e) {
    console.error(`\n❌ Command failed: ${cmd}`);
    process.exit(1);
  }
};

const findPackageJsons = (dir: string, fileList: string[] = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== ".git" &&
        file !== "dist" &&
        file !== ".next"
      ) {
        findPackageJsons(fullPath, fileList);
      }
    } else if (file === "package.json") {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

async function deploy() {
  console.log("🚀 Starting OpenCrow Interactive Deployment Process...\n");

  const rootPkgPath = path.join(rootDir, "package.json");
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
  const currentVersion = rootPkg.version;

  console.log(`Current Workspace Version: v${currentVersion}`);
  const newVersion = await question(
    `Enter the new version (e.g., 1.0.0) [leave empty to abort]: `,
  );

  if (!newVersion || !newVersion.trim()) {
    console.log("Aborted.");
    process.exit(0);
  }

  await question(
    `\nPlease add the changelog for version ${newVersion} in changelog.json, save it, and press Enter to continue...`,
  );

  const jsonPath = path.join(rootDir, "changelog.json");
  let changelogData: any = {};
  try {
    changelogData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (e) {
    console.error("❌ Failed to read changelog.json. Ensure it is valid JSON.");
    process.exit(1);
  }

  if (!changelogData[newVersion]) {
    console.error(
      `❌ Version ${newVersion} not found in changelog.json. Aborting...`,
    );
    process.exit(1);
  }

  const releaseData = changelogData[newVersion];
  const changelogEntry = releaseData.changes
    ? releaseData.changes.map((c: string) => `- ${c}`).join("\n")
    : "No changelog provided.";

  console.log(`\n📦 Bumping versions to \x1b[32m${newVersion}\x1b[0m...`);
  const allPkgFiles = findPackageJsons(rootDir);
  let filesUpdated = 0;

  for (const file of allPkgFiles) {
    try {
      const pkgData = JSON.parse(fs.readFileSync(file, "utf8"));
      let modified = false;

      if (pkgData.version && pkgData.version !== newVersion) {
        pkgData.version = newVersion;
        modified = true;
      }

      ["dependencies", "devDependencies", "peerDependencies"].forEach(
        (depType) => {
          if (pkgData[depType]) {
            for (const dep of Object.keys(pkgData[depType])) {
              if (
                dep.startsWith("@opencrow/") &&
                pkgData[depType][dep] !== "workspace:*"
              ) {
                if (pkgData[depType][dep] !== newVersion) {
                  pkgData[depType][dep] = newVersion;
                  modified = true;
                }
              }
            }
          }
        },
      );

      if (modified) {
        fs.writeFileSync(file, JSON.stringify(pkgData, null, 2) + "\n");
        filesUpdated++;
      }
    } catch (e) {
      console.warn(`Warning: Could not process ${file}`);
    }
  }
  console.log(`Successfully updated ${filesUpdated} package.json files.`);

  console.log(`\n📝 Loaded changelog for v${newVersion} from changelog.json`);

  console.log(`\n🐳 Building Docker Images...`);
  const baseImage = `himanshu806/opencrow`;

  const builds = [
    { file: "Dockerfile.app", tag: "app" },
    { file: "Dockerfile.backend", tag: "backend" },
  ];

  for (const build of builds) {
    const fullTagName = `${baseImage}-${build.tag}`;
    console.log(`\n--- Building ${fullTagName}:v${newVersion} ---`);
    run(
      `docker build -f ${build.file} -t ${fullTagName}:v${newVersion} -t ${fullTagName}:latest .`,
    );

    console.log(`\n--- Pushing ${fullTagName} ---`);
    run(`docker push ${fullTagName}:v${newVersion}`);
    run(`docker push ${fullTagName}:latest`);
  }

  console.log(`\n📦 Publishing Widget to NPM...`);
  run(`pnpm build --filter=@opencrow/ui`);
  run(`cd packages/widget && npm publish --access public`);

  console.log(`\n💾 Committing changes...`);
  run(`git add -A "**/package.json" package.json changelog.json`);

  const status = run("git status --porcelain", true);
  if ((status as string).trim() !== "") {
    run(`git commit -m "chore: release v${newVersion}"`);
  }

  console.log(`\n🏷️ Creating Git Tag...`);
  run(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

  console.log(`Pushing commits and tags to remote...`);
  run(`git push origin HEAD`);
  run(`git push origin v${newVersion}`);

  console.log(`\n📦 Creating GitHub Release...`);
  try {
    run(
      `gh release create v${newVersion} -t "Release v${newVersion}" -n "${changelogEntry}"`,
    );
    console.log(`\n✨ Successfully created release v${newVersion}!`);
  } catch (e) {
    console.error(
      "\nFailed to create GitHub release via 'gh' CLI. Continuing...",
    );
  }

  console.log(`\n✅ Deployment Complete!`);
  rl.close();
}

deploy().catch((err) => {
  console.error(err);
  rl.close();
});
