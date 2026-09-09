import { Check, GraduationCap, Quote } from "lucide-react";

/**
 * Static, hand-drawn product mock: tutor Q&A with cited sources + a quiz.
 * Replaced by real product screenshots later (Phase 9/10).
 */
export function Demo() {
  return (
    <section id="demo" className="scroll-mt-20 border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Demo
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            See it in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ask a question about your lecture notes — get an answer with the
            receipts.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Tutor chat mock */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <GraduationCap className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Tutor
                </p>
                <p className="text-xs text-muted-foreground">
                  Answering from “Lecture 4 – Neural Nets.pdf”
                </p>
              </div>
            </div>

            <div className="space-y-3 py-4">
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                What is backpropagation, in one paragraph?
              </p>
              <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm leading-relaxed text-foreground dark:border-brand-900 dark:bg-brand-950/40">
                <p>
                  Backpropagation computes the gradient of the loss with
                  respect to every weight by applying the chain rule backward
                  through the network — from the output error to the first
                  hidden layer…
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Lecture 4 §2.3", "slides p.12", "notes p.31"].map(
                    (source) => (
                      <span
                        key={source}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-background px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:border-brand-800 dark:text-brand-300"
                      >
                        <Quote className="h-2.5 w-2.5" aria-hidden />
                        {source}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quiz mock */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              Quick quiz · 5 questions
            </p>
            <div className="mt-3 rounded-xl border border-border p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Multiple choice
              </p>
              <p className="mt-1.5 text-sm font-medium text-foreground">
                What does backpropagation compute?
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { text: "Gradients of the loss w.r.t. weights", correct: true },
                  { text: "The network architecture", correct: false },
                  { text: "Training data labels", correct: false },
                ].map((option) => (
                  <li key={option.text}>
                    <span
                      className={
                        option.correct
                          ? "flex items-center gap-2 rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground"
                      }
                    >
                      {option.correct && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                      )}
                      {option.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Every wrong answer feeds your{" "}
              <span className="font-medium text-foreground">weak topics</span>{" "}
              profile — so review suggestions stay relevant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
