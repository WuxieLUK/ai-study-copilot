"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock,
  GraduationCap,
  Layers3,
  Lightbulb,
  Pause,
  Play,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const AUTOPLAY_MS = 7000;

const TABS = [
  { id: "tutor", label: "Tutor", icon: GraduationCap },
  { id: "flashcards", label: "Flashcards", icon: Layers3 },
  { id: "plan", label: "Study plan", icon: Target },
  { id: "quiz", label: "Quiz", icon: Brain },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Demo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % TABS.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const activeId = TABS[activeIndex].id;

  return (
    <section id="demo" className="scroll-mt-20 border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Product tour
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            One workspace, the whole study loop
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Read, recall, practice, plan — every surface is grounded in your
            own materials.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="ring-glow overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-2xl shadow-brand-950/10 dark:bg-card/80">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 hidden rounded-md bg-background px-3 py-1 text-xs text-muted-foreground sm:block">
                app.aistudycopilot.com
              </span>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
              >
                {paused ? (
                  <Play className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Pause className="h-3.5 w-3.5" aria-hidden />
                )}
                {paused ? "Play" : "Auto"}
              </button>
            </div>

            {/* Feature tabs */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background/60 px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={isActive}
                    className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-2 h-0.5 rounded-full bg-brand-500" />
                    )}
                  </button>
                );
              })}
              <div className="ml-auto hidden shrink-0 items-center gap-2 pr-1 sm:flex">
                {TABS.map((tab, index) => (
                  <span
                    key={tab.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeIndex
                        ? "w-6 bg-brand-500"
                        : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Active panel */}
            <div className="relative bg-background p-5 sm:p-7">
              <Panel key={activeId} id={activeId} />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Open the full interactive demo
            <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Panel({ id }: { id: TabId }) {
  if (id === "tutor") return <TutorPanel />;
  if (id === "flashcards") return <FlashcardsPanel />;
  if (id === "plan") return <PlanPanel />;
  return <QuizPanel />;
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}

function TutorPanel() {
  return (
    <PanelShell>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white">
              What does backpropagation compute, in one paragraph?
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="space-y-2.5">
              <p className="max-w-[92%] rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                Backpropagation computes the gradient of the loss with respect
                to every weight by applying the chain rule backwards through
                the network <span className="font-semibold text-brand-600 dark:text-brand-400">[1]</span>.
                Those gradients tell the optimizer how to update each
                parameter to reduce loss <span className="font-semibold text-brand-600 dark:text-brand-400">[2]</span>.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Lecture 4 §2.3", "slides p.12"].map((source, index) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                  >
                    <Quote className="h-2.5 w-2.5" aria-hidden />
                    [{index + 1}] {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            Why it works
          </p>
          <ul className="mt-3 space-y-2.5">
            {[
              "Answers only from your notes",
              "Every claim carries a citation",
              "No invented facts, ever",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}

function FlashcardsPanel() {
  return (
    <PanelShell>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-foreground">Active recall</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The card flips itself after a few seconds — try to recall the
            answer before it does.
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" aria-hidden />
            Hint: adenosine triphosphate
          </p>
        </div>

        <div className="[perspective:1600px]">
          <div className="animate-flip-y relative h-56 w-full [transform-style:preserve-3d] sm:h-60">
            <div className="absolute inset-0 flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm [backface-visibility:hidden]">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                Biology · Card 3 of 12
              </span>
              <p className="mt-5 text-lg font-semibold leading-snug text-balance text-foreground">
                What is the energy currency of the cell?
              </p>
              <p className="mt-auto text-xs text-muted-foreground">Click or press space to flip</p>
            </div>
            <div className="absolute inset-0 flex flex-col rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-emerald-900 dark:from-emerald-950/60 dark:to-teal-950/40">
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-white/10 dark:text-emerald-200">
                Answer
              </span>
              <p className="mt-5 text-base font-medium leading-relaxed text-foreground">
                ATP — adenosine triphosphate. Its high-energy phosphate bonds
                power most cellular work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function PlanPanel() {
  const tasks = [
    { label: "Read", detail: "Backpropagation notes §2.1–2.3", time: "12 min", icon: BookOpen, tone: "text-sky-600 dark:text-sky-400" },
    { label: "Recall", detail: "Flashcard deck · Neural nets", time: "8 min", icon: Layers3, tone: "text-violet-600 dark:text-violet-400" },
    { label: "Practice", detail: "Quiz · 6 questions", time: "10 min", icon: Brain, tone: "text-brand-600 dark:text-brand-400" },
  ];

  return (
    <PanelShell>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Day 3 · Today&apos;s focus</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Backpropagation — master it</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              82% mastery
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {tasks.map((task, index) => {
              const Icon = task.icon;
              return (
                <li
                  key={task.label}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${task.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{task.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{task.detail}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {task.time}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
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
          <div className="mt-4 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" aria-hidden />
            <p className="text-xs text-muted-foreground">2 of 3 tasks done today</p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function QuizPanel() {
  return (
    <PanelShell>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Multiple choice · Question 1 of 6
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">01:24</span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            What does the gradient computed by backpropagation tell us?
          </p>
          <ul className="mt-4 space-y-2">
            {[
              { text: "How to adjust weights to reduce loss", correct: true },
              { text: "The exact labels of the training data", correct: false },
              { text: "The number of layers in the network", correct: false },
            ].map((option) => (
              <li key={option.text}>
                <span
                  className={
                    option.correct
                      ? "flex items-center gap-2 rounded-xl border border-emerald-300/70 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm text-foreground"
                  }
                >
                  {option.correct && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                  {option.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Score this session</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
            5<span className="text-lg text-muted-foreground">/6</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
              style={{ width: "83%" }}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Wrong answers feed your <span className="font-medium text-foreground">weak-topic profile</span> so
            your next study plan targets them.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
