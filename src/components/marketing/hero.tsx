import Link from "next/link";
import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl dark:bg-brand-500/20" />
        <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute top-64 -right-24 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            A real learning system — not a chat wrapper
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-balance text-foreground sm:text-6xl">
            Turn your course materials into a{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-400">
              personal learning system
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
            Upload your PDFs, notes and slides. AI Study Copilot summarizes
            them, extracts key concepts, quizzes you, analyzes your mistakes
            and tutors you — always grounded in your own materials.
          </p>

          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700 sm:w-auto"
            >
              Start learning free
              <ArrowRight
                className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
            >
              <BookOpenCheck className="h-4.5 w-4.5 text-muted-foreground" aria-hidden />
              See how it works
            </a>
          </div>

          <dl className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {[
              ["Summarize", "Any document → structured notes in seconds"],
              ["Quiz", "MCQs, true/false and short answers"],
              ["Analyze", "Weak topics + a plan to fix them"],
            ].map(([term, desc]) => (
              <div key={term} className="bg-card p-4 text-left">
                <dt className="text-sm font-semibold text-foreground">
                  {term}
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
