import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Zap,
  Database,
  Code,
  ChevronRight,
  Layout,
  Terminal,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen opacity-50 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-900/20 blur-[130px] mix-blend-screen opacity-50 animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-white to-gray-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <Bot size={20} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              OpenCrow
            </span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link
              href="#features"
              className="hover:text-white transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/docs/user/getting-started"
              className="hover:text-white transition-colors relative group"
            >
              Docs
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="https://github.com/himasnhu-at/opencrow"
              className="bg-white/10 text-white border border-white/20 px-5 py-2 rounded-full text-sm hover:scale-105 hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-36 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 text-sm font-medium text-purple-200 mb-8 border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              v0.1 is live now
            </span>
          </div>
          <h1 className="animate-fade-in-up delay-100 text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent pb-4">
            Embed AI Agents
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent relative">
              In Minutes.
              <div className="absolute -bottom-2 left-0 w-full h-4 bg-purple-500/20 blur-xl opacity-50"></div>
            </span>
          </h1>
          <p className="animate-fade-in-up delay-200 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Build, deploy, and monitor AI agents that understand your product.
            Connect to your APIs and control your frontend with a single line of
            code.
          </p>
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-5">
            <Link
              href="https://github.com/himasnhu-at/opencrow"
              className="group bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 hover:gap-3 text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Building Free
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/docs/user/getting-started"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-semibold transition-all text-lg backdrop-blur-md"
            >
              Read Documentation
            </Link>
          </div>
        </section>

        {/* Video / Demo Section */}
        <section className="max-w-6xl mx-auto px-6 mt-32 mb-40 relative group perspective-[2000px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
          <div className="animate-fade-in-up delay-500 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 backdrop-blur-sm aspect-video cursor-pointer transform transition-transform duration-700 hover:rotate-x-2">
            <div className="absolute top-0 w-full h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2 z-10 backdrop-blur-md">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="mx-auto text-xs text-gray-400 font-mono tracking-wider flex items-center gap-2">
                <Zap size={12} className="text-yellow-500" /> opencrow-demo.app
              </div>
            </div>
            <video
              src="/opencrow.mp4"
              poster="/demo-screenshot.png"
              controls
              className="w-full h-full object-cover pt-12"
            />
          </div>
        </section>

        {/* Features Bento Grid */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-6 py-20 relative"
        >
          <div className="text-center mb-20 relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent inline-block">
              Superpowers for your App
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to ship production-ready agents today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Card 1: Main Feature (Large) */}
            <div className="md:col-span-2 row-span-1 bg-white/5 hover:bg-white/[0.07] backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 relative overflow-hidden group transition-all duration-500 hover:border-purple-500/30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Layout size={28} />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-white">
                    Split-View Command Center
                  </h3>
                  <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                    Manage agent sessions, debug logs, and user configurations
                    side-by-side in a beautiful interface.
                  </p>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-[55%] h-[85%] bg-black border-t border-l border-white/10 rounded-tl-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] translate-y-8 translate-x-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700 p-6 overflow-hidden">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse" />
                    <div className="space-y-3 w-full">
                      <div className="h-2 w-24 bg-purple-500/40 rounded-full" />
                      <div className="h-2 w-full bg-white/10 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end items-center mt-6">
                    <div className="space-y-3 w-3/4">
                      <div className="h-16 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/5 rounded-xl flex items-center px-4 text-xs font-mono text-gray-500">
                        Processing intent...
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl mix-blend-screen rounded-full"></div>
              </div>
            </div>

            {/* Card 2: Knowledge */}
            <div className="bg-white/5 hover:bg-white/[0.07] backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 flex flex-col justify-between group overflow-hidden transition-all duration-500 hover:border-blue-500/30">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-500">
                  <Database size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Vector Memory
                </h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  Ingest large datasets and docs instantly via LanceDB powered
                  RAG.
                </p>
              </div>
              <div className="mt-8 relative h-24 flex justify-center items-end opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent bottom-4"></div>
                <div className="flex gap-3 items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-6 h-12 bg-white/10 rounded-t-sm border-t border-white/20"></div>
                  <div className="w-6 h-20 bg-blue-500/40 rounded-t-sm border-t border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
                  <div className="w-6 h-16 bg-white/10 rounded-t-sm border-t border-white/20"></div>
                  <div className="w-6 h-8 bg-white/10 rounded-t-sm border-t border-white/20"></div>
                </div>
              </div>
            </div>

            {/* Card 3: Integration (Large) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-10 md:col-span-1 relative overflow-hidden group transition-all duration-500 hover:border-green-500/30 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-6 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                  <Terminal size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Real-time Tracing
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed">
                  Deep dive into LLM calls, latency, and tool execution
                  environments.
                </p>
              </div>
              <div className="mt-8 font-mono text-[11px] leading-relaxed text-green-400/80 bg-black/80 p-5 rounded-xl border border-zinc-800 shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(transparent_0%,rgba(74,222,128,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scan opacity-50 pointer-events-none"></div>
                {`> info: Tool call initiated`}
                <br />
                {`> fn: "navigateToPage"`}
                <br />
                <span className="text-blue-400">{`> payload: { path: "/cart" }`}</span>
                <br />
                {`> latency: 124ms`}
                <br />
                <span className="text-white font-bold">{`> status: EXECUTED_CLIENT`}</span>
              </div>
            </div>

            {/* Card 4: Embed Code */}
            <div className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
              <div className="flex-1 relative z-10 w-full">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6 text-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <Code size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-white">
                  Drop-in Frontend Logic
                </h3>
                <p className="text-purple-200/80 text-lg leading-relaxed max-w-sm">
                  Let your AI trigger UI updates on your site directly. Map
                  Javascript functions to LLM intents effortlessly.
                </p>
              </div>
              <div className="flex-1 w-full relative z-10">
                <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10 group-hover:border-purple-500/50 group-hover:-translate-y-2 transition-all duration-500">
                  <div className="flex gap-2 mb-4 items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                    <span className="ml-2 text-xs text-gray-500 font-mono">
                      App.tsx
                    </span>
                  </div>
                  <code className="text-xs md:text-sm text-gray-300 font-mono leading-loose block overflow-x-auto whitespace-pre">
                    <span className="text-purple-400">import</span>{" "}
                    {`{ OpenCrow }`}{" "}
                    <span className="text-purple-400">from</span>{" "}
                    <span className="text-green-300">'@opencrow/widget'</span>;
                    <br />
                    <br />
                    <span className="text-blue-400">&lt;OpenCrow</span>
                    <br />
                    {"  "}projectId=
                    <span className="text-green-300">"dev_123"</span>
                    <br />
                    {"  "}tools={<span className="text-yellow-300">{`{`}</span>}
                    <br />
                    {"    "}
                    <span className="text-blue-300">navigate</span>:{" "}
                    <span className="text-purple-400">(</span>
                    <span className="text-orange-300">args</span>
                    <span className="text-purple-400">)</span>{" "}
                    <span className="text-purple-400">=&gt;</span>{" "}
                    <span className="text-yellow-300">{`{`}</span>...
                    <span className="text-yellow-300">{`}`}</span>
                    <br />
                    {"  "}
                    <span className="text-yellow-300">{`}`}</span>
                    <br />
                    <span className="text-blue-400">/&gt;</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 relative z-10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Bot size={18} className="text-purple-400" /> OpenCrow Platform
          </div>
          <div className="text-sm text-gray-500">
            © 2026 OpenCrow Open Source.
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <Link
              href="https://github.com/himasnhu-at/opencrow"
              className="hover:text-white transition-colors"
            >
              GitHub Repo
            </Link>
            <Link
              href="/docs/user/getting-started"
              className="hover:text-white transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
