import {
  FileSearch,
  MessageSquareQuote,
  ListChecks,
  CircleHelp,
  TrendingUp,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "AI summaries",
    description:
      "Upload a PDF, Markdown or TXT and get a concise, structured summary of what matters — chapters, key claims and formulas included.",
  },
  {
    icon: MessageSquareQuote,
    title: "AI tutor, grounded in your notes",
    description:
      "Ask anything. Answers are retrieved from your own documents via RAG and every answer cites the exact source passages.",
  },
  {
    icon: ListChecks,
    title: "Auto-generated quizzes",
    description:
      "Turn any chapter into multiple-choice, true/false and short-answer questions in one click.",
  },
  {
    icon: CircleHelp,
    title: "Mistake analysis",
    description:
      "After every quiz, see which questions you missed, why, and which concepts you should revisit.",
  },
  {
    icon: Target,
    title: "Personalized review plan",
    description:
      "Performance data is turned into weak / strong topic profiles and a concrete 'what to review next' list.",
  },
  {
    icon: TrendingUp,
    title: "Progress dashboard",
    description:
      "Documents processed, quizzes taken, accuracy over time — one place to see your learning trajectory.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Everything you need to actually learn the material
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A closed loop: read, understand, practice, diagnose, improve.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
