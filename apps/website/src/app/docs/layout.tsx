import Link from "next/link";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900 pt-14">
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg tracking-tight"
          >
            OpenCrow Docs
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-black dark:hover:text-white">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 py-10 px-6 border-r border-gray-100 dark:border-white/10 hidden md:block md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                User Guide
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/docs/user/getting-started"
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Getting Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Developer Guide
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/docs/developer/architecture"
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Architecture
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-10 px-6 md:px-12 lg:px-20">
          <div className="mx-auto max-w-3xl animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
