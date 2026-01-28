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
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="h-6 w-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Bot size={16} />
            </div>
            OpenCrow
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link
              href="#features"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="http://localhost:3000"
              className="bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 rounded-full text-xs hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-900 dark:text-white mb-6 border border-gray-200 dark:border-white/10">
              v1.0 is now available
            </span>
          </div>
          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent pb-2">
            Intelligent Agents.
            <br />
            Effortless Integration.
          </h1>
          <p className="animate-fade-in-up delay-200 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build, deploy, and monitor AI agents that understand your product.
            Embed with one line of code.
          </p>
          <div className="animate-fade-in-up delay-300 flex items-center gap-4">
            <Link
              href="http://localhost:3000"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 hover:gap-3"
            >
              Start Building
              <ChevronRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              href="#"
              className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Video / Demo Section */}
        <section className="max-w-6xl mx-auto px-6 mt-24 mb-32">
          <div className="animate-fade-in-up delay-500 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 aspect-video group cursor-pointer">
            {/* Using the screenshot as a placeholder for the video */}
            <Image
              src="/demo-screenshot.png"
              alt="OpenCrow Functionality Demo"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
            {/* Optional: Actual video tag if file existed */}
            {/* <video src="/demo.mp4" poster="/demo-screenshot.png" controls className="w-full h-full object-cover" /> */}
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-16 dark:text-white">
            Everything you need to ship AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Main Feature (Large) */}
            <div className="md:col-span-2 row-span-1 bg-gray-50 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  <Layout />
                </div>
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">
                  Split-View Conversations
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Manage sessions efficiently with our new split-view interface.
                  See history and details side-by-side.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-3/4 bg-white dark:bg-black border-t border-l border-gray-200 dark:border-white/10 rounded-tl-2xl shadow-lg translate-y-4 translate-x-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500 p-4">
                {/* Micro UI visual */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-2 w-20 bg-gray-200 dark:bg-white/20 rounded" />
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="space-y-2 w-3/4">
                      <div className="h-10 w-full bg-blue-500 rounded-lg opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Knowledge */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 flex flex-col justify-between group overflow-hidden">
              <div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                  <Database />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Knowledge Base
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Ingest PDFs, docs, and websites instantly.
                </p>
              </div>
              <div className="mt-8 relative h-20">
                <div className="absolute inset-0 flex items-center gap-2 animate-pulse opacity-50">
                  <div className="h-16 w-12 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-sm -rotate-6" />
                  <div className="h-16 w-12 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-sm rotate-3 z-10" />
                  <div className="h-16 w-12 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-sm -rotate-2" />
                </div>
              </div>
            </div>

            {/* Card 3: Integration (Large) */}
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-8 md:col-span-1 border border-gray-800 dark:border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 dark:bg-black/10 rounded-2xl flex items-center justify-center mb-4">
                  <Terminal className="text-white dark:text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Debug Tools</h3>
                <p className="text-gray-300 dark:text-gray-600 text-sm">
                  Inspect every function call, argument, and output in
                  real-time.
                </p>
              </div>
              <div className="mt-8 font-mono text-xs text-green-400 bg-gray-900 p-4 rounded-lg border border-gray-700">
                {`> tool_call: "listOrders"`}
                <br />
                {`> args: { status: "shipped" }`}
                <br />
                {`> status: success`}
              </div>
            </div>

            {/* Card 4: Embed Code */}
            <div className="md:col-span-2 bg-gray-50 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-8 group">
              <div className="flex-1">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                  <Code />
                </div>
                <h3 className="text-2xl font-semibold mb-2 dark:text-white">
                  One-Line Integration
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Copy our widget snippet and drop it into any website. It just
                  works.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-gray-900 rounded-xl p-4 shadow-xl border border-gray-800 group-hover:scale-105 transition-transform duration-500">
                  <div className="flex gap-1.5 mb-3 px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <code className="text-[10px] md:text-xs text-blue-300 font-mono leading-relaxed block overflow-hidden">
                    &lt;script
                    src="https://cdn.opencrow.ai/widget.js"&gt;&lt;/script&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot size={16} /> OpenCrow
          </div>
          <div className="text-sm text-gray-500">
            © 2026 OpenCrow Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link href="#" className="hover:text-black dark:hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-black dark:hover:text-white">
              Terms
            </Link>
            <Link href="#" className="hover:text-black dark:hover:text-white">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
