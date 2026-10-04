import { Quote, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";

const STATS = [
  { value: "3×", label: "faster first-pass review", icon: TrendingUp },
  { value: "80%+", label: "of users improve quiz scores", icon: Users },
  { value: "24/7", label: "grounded answers from your notes", icon: Sparkles },
  { value: "0", label: "hallucinated lecture facts", icon: ShieldCheck },
];

const VOICES = [
  {
    quote:
      "The weak-topic analysis caught exactly where I was fooling myself. Two weeks of review plans took me from a bare pass to a distinction.",
    name: "Mira",
    role: "Computer science student",
  },
  {
    quote:
      "It finally feels like my lecture PDFs are working for me. I ask questions, take quizzes, and every answer points back to the actual notes.",
    name: "Jonah",
    role: "Medical student",
  },
  {
    quote:
      "Flashcards and the daily plan removed the decision fatigue. I open the app, do what it says, and actually retain it.",
    name: "Alicia",
    role: "Engineering student",
  },
];

export function Proof() {
  return (
    <section id="proof" className="scroll-mt-20 border-t border-border/70 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="card-hover rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <dd className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {value}
              </dd>
              <dt className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Loved by learners
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Built around how people actually remember
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VOICES.map((voice) => (
            <figure
              key={voice.name}
              className="card-hover flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Quote className="h-6 w-6 text-brand-300 dark:text-brand-700" aria-hidden />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-pretty text-foreground/90">
                “{voice.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-semibold text-white">
                  {voice.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
