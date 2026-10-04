"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const ITEMS = [
  {
    question: "Where does the AI get its answers?",
    answer:
      "Only from the materials you upload. Every document is split into chunks and embedded into a private vector index. Tutor answers and quizzes are grounded in those chunks, and the tutor cites the exact source passages.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "PDF, Markdown, and plain text. Files are uploaded to your private storage, then extracted, cleaned, and indexed automatically. Processing status is shown on the Documents page.",
  },
  {
    question: "Does it work with my notes in any language?",
    answer:
      "The default embedding model is multilingual, and the chat model follows the language you write in. You can also configure any OpenAI-compatible chat or embedding provider via environment variables.",
  },
  {
    question: "Is my course content private?",
    answer:
      "Yes. Supabase Row Level Security keeps documents, chunks, and quiz data scoped to your account. Your files are only used to answer your questions and generate your study materials.",
  },
  {
    question: "Can I use my own AI provider?",
    answer:
      "Yes. The backend speaks the OpenAI-compatible protocol, so DeepSeek, OpenAI, Groq, or a local server all work with just environment configuration.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-border/70">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {item.question}
                  </span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                    aria-hidden
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
