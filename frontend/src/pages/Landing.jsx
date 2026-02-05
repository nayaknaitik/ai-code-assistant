import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        {/* Navbar */}
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">
            AI Code Assistant
          </div>

          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <Link to="/login" className="transition hover:text-zinc-100">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-indigo-500/90 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
            >
              Try for free
            </Link>
          </nav>
        </header>

        {/* Hero (Centered) */}
        <section className="mt-28 flex flex-col items-center gap-8 text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-wide text-zinc-400">
            Built for serious developers
          </span>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Build faster with an{" "}
            <span className="font-cursive text-indigo-400">Editor</span>{" "}
            powered by{" "}
            <span className="font-cursive text-indigo-400">AI</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            A premium coding environment combining Groq-speed inference,
            Monaco precision, and secure authenticated workspaces —
            designed to keep you in flow.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              Start coding
            </Link>

            <Link
              to="/register"
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Create an account
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Groq-speed inference",
              desc: "Sub-second AI responses using open, high-performance models.",
            },
            {
              title: "Auth-protected editor",
              desc: "Your code stays private with JWT-secured workspaces.",
            },
            {
              title: "Chat-driven coding",
              desc: "Tell the AI what to build — review changes before applying.",
            },
            {
              title: "Diff-first workflow",
              desc: "No blind edits. Every AI change is transparent and reversible.",
            },
            {
              title: "File persistence",
              desc: "Save, load, and manage files per account seamlessly.",
            },
            {
              title: "AMOLED-first design",
              desc: "Pure dark UI crafted for focus and long coding sessions.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-indigo-500/50"
            >
              <h3 className="text-sm font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
