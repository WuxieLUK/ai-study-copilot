import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { InteractiveDemo } from "@/components/demo/interactive-demo";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Try the AI Study Copilot product tour — tutor answers with citations, spaced-repetition flashcards, a coach-designed study plan, and adaptive quizzes. No account required.",
};

export default function DemoPage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            Interactive demo · no account needed
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Try the whole study loop
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Click through each surface below — ask the tutor, flip cards,
            check off plan tasks and answer a quiz.
          </p>
        </div>

        <div className="mt-12">
          <InteractiveDemo />
        </div>

        <div className="mx-auto mt-14 max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Ready to build it from your own notes?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Upload a PDF and your personal study system comes to life in
            minutes.
          </p>
          <Link
            href="/signup"
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700"
          >
            Create free account
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
