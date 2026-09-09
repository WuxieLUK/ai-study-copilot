import { UploadCloud, DatabaseZap, GraduationCap } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    step: "01",
    title: "Upload your materials",
    description:
      "Drop in lecture PDFs, Markdown notes or plain text. Each file is parsed, cleaned and stored under your account.",
  },
  {
    icon: DatabaseZap,
    step: "02",
    title: "We build your knowledge base",
    description:
      "Documents are split into focused chunks and embedded into a vector database (RAG). Your copilot now 'knows' your course.",
  },
  {
    icon: GraduationCap,
    step: "03",
    title: "Ask, practice and improve",
    description:
      "Chat with an AI tutor that cites your notes, take quizzes generated from them, and get a plan for your weak spots.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border/70 bg-muted/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            From raw PDF to study loop in three steps
          </h2>
        </div>

        <ol className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.step} className="relative">
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute top-6 left-[calc(50%+3rem)] hidden h-px w-[calc(100%-6rem)] bg-border md:block"
                />
              )}
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-brand-600 shadow-sm dark:text-brand-400">
                    <step.icon className="h-5.5 w-5.5" aria-hidden />
                  </span>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
