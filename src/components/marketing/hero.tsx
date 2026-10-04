import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  GraduationCap,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora absolute -top-40 left-1/2 h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/20 via-violet-500/15 to-sky-400/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            A complete learning system — not a chat wrapper
          </p>

          <h1
            className="animate-fade-up mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance text-foreground sm:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Turn notes into{" "}
            <span className="shimmer-text">memory that lasts</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Upload your PDFs, slides and notes. AI Study Copilot builds a
            private knowledge base, then coaches you with summaries, quizzes,
            flashcards, tutor answers and a daily study plan.
          </p>

          <div
            className="animate-fade-up mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/35 sm:w-auto"
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

          <p
            className="animate-fade-up mt-6 text-xs text-muted-foreground"
            style={{ animationDelay: "320ms" }}
          >
            Free to start · No credit card · Your content stays private
          </p>
        </div>

        <div className="animate-fade-up relative mx-auto mt-16 max-w-5xl" style={{ animationDelay: "380ms" }}>
          <div className="ring-glow overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-2xl shadow-brand-950/10 dark:bg-card/80">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 hidden rounded-md bg-background px-3 py-1 text-xs text-muted-foreground sm:block">
                app.aistudycopilot.com/dashboard
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Today&apos;s focus</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">Backpropagation — master it</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    82% mastery
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Read", "Notes §2.1–2.3", "12 min"],
                    ["Recall", "Flashcard deck", "8 min"],
                    ["Practice", "Quiz · 6 questions", "10 min"],
                  ].map(([label, detail, time]) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{label}</p>
                      <p className="mt-1 text-sm text-foreground">{detail}</p>
                      <p className="mt-2 text-[11px] text-muted-foreground">{time}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 dark:border-brand-900 dark:bg-brand-950/30">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <GraduationCap className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      What does backpropagation compute?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gradients of the loss w.r.t. weights <span className="text-brand-600 dark:text-brand-400">[2]</span>
                    </p>
                  </div>
                  <Quote className="ml-auto h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Weekly momentum</p>
                    <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
                  </div>
                  <div className="mt-4 flex h-28 items-end gap-2">
                    {[42, 55, 48, 70, 62, 84, 92].map((height, index) => (
                      <div
                        key={`${height}-${index}`}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-violet-400"
                        style={{ height: `${height}%`, opacity: 0.45 + index * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                    <p className="text-sm text-foreground">3 days left on your plan</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
