"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock,
  GraduationCap,
  Layers3,
  Lightbulb,
  Quote,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const TABS = [
  { id: "tutor", label: "Tutor", icon: GraduationCap },
  { id: "flashcards", label: "Flashcards", icon: Layers3 },
  { id: "plan", label: "Study plan", icon: Target },
  { id: "quiz", label: "Quiz", icon: Brain },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function InteractiveDemo() {
  const [active, setActive] = useState<TabId>("tutor");

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-2xl shadow-brand-950/10 dark:bg-card/80">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background/60 px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-pressed={isActive}
              className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-background p-5 sm:p-7">
        {active === "tutor" && <TutorDemo />}
        {active === "flashcards" && <FlashcardsDemo />}
        {active === "plan" && <PlanDemo />}
        {active === "quiz" && <QuizDemo />}
      </div>
    </div>
  );
}

function TutorDemo() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Hi! I answer from your uploaded course materials, with citations. Try one of the questions below — or ask your own.",
    },
  ]);
  const [input, setInput] = useState("");

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Backpropagation computes the gradient of the loss with respect to every weight by applying the chain rule backwards through the network [1]. Those gradients tell the optimizer how to update each parameter to reduce loss [2].",
        },
      ]);
    }, 650);
  }

  const suggestions = [
    "What is backpropagation?",
    "Summarize the key ideas in my notes.",
    "What are the common mistakes in this topic?",
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="flex min-h-[20rem] flex-col">
        <div className="flex-1 space-y-4">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={index} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                  {message.text}
                </p>
              </div>
            ) : (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="max-w-[92%] space-y-2">
                  <p className="rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                    {message.text}
                  </p>
                  {message.text.includes("[1]") && (
                    <div className="flex flex-wrap gap-1.5">
                      {["Lecture 4 §2.3", "slides p.12"].map((source, i) => (
                        <span
                          key={source}
                          className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                        >
                          <Quote className="h-2.5 w-2.5" aria-hidden />
                          [{i + 1}] {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-brand-400/70 hover:bg-brand-50/50 dark:hover:bg-brand-950/30"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything about your course materials…"
            className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Send
          </button>
        </form>
      </div>

      <aside className="rounded-xl border border-border bg-card p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
          Why it works
        </p>
        <ul className="mt-3 space-y-2.5">
          {["Answers only from your notes", "Every claim carries a citation", "No invented facts, ever"].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function FlashcardsDemo() {
  const cards = [
    { front: "What is the energy currency of the cell?", back: "ATP — adenosine triphosphate. Its high-energy phosphate bonds power most cellular work.", hint: "adenosine triphosphate" },
    { front: "What does the 'central dogma' describe?", back: "The flow of genetic information: DNA → RNA → protein.", hint: "three arrows" },
    { front: "What is a neuron's resting membrane potential?", back: "About -70 mV, maintained by the sodium-potassium pump.", hint: "negative value" },
  ];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const card = cards[index];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
          {cards.length} cards · {known.length} mastered
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setFlipped(false);
            setKnown([]);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="mt-5 block w-full text-left [perspective:1600px] focus:outline-none"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div
          className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm [backface-visibility:hidden]">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              Biology · Card {index + 1} of {cards.length}
            </span>
            <p className="mt-6 text-xl font-semibold leading-snug text-balance text-foreground">
              {card.front}
            </p>
            <p className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              Hint: {card.hint}
            </p>
          </div>
          <div className="absolute inset-0 flex flex-col rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-emerald-900 dark:from-emerald-950/60 dark:to-teal-950/40">
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-white/10 dark:text-emerald-200">
              Answer
            </span>
            <p className="mt-6 text-base font-medium leading-relaxed text-foreground">
              {card.back}
            </p>
          </div>
        </div>
      </button>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setFlipped(false);
            setIndex((current) => Math.max(0, current - 1));
          }}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          onClick={() =>
            setKnown((current) =>
              current.includes(index) ? current.filter((n) => n !== index) : [...current, index],
            )
          }
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            known.includes(index)
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden />
          {known.includes(index) ? "Mastered" : "I know it"}
        </button>
        <button
          type="button"
          onClick={() => {
            setFlipped(false);
            setIndex((current) => Math.min(cards.length - 1, current + 1));
          }}
          disabled={index === cards.length - 1}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
        >
          Next
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function PlanDemo() {
  const [done, setDone] = useState<number[]>([0]);
  const tasks = [
    { label: "Read", detail: "Backpropagation notes §2.1–2.3", time: "12 min", icon: BookOpen, tone: "text-sky-600 dark:text-sky-400" },
    { label: "Recall", detail: "Flashcard deck · Neural nets", time: "8 min", icon: Layers3, tone: "text-violet-600 dark:text-violet-400" },
    { label: "Practice", detail: "Quiz · 6 questions", time: "10 min", icon: Brain, tone: "text-brand-600 dark:text-brand-400" },
  ];

  return (
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
            const isDone = done.includes(index);
            return (
              <li key={task.label}>
                <button
                  type="button"
                  onClick={() =>
                    setDone((current) =>
                      current.includes(index)
                        ? current.filter((n) => n !== index)
                        : [...current, index],
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    isDone
                      ? "border-emerald-300/70 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-border/70 bg-card hover:border-brand-300"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : `bg-muted ${task.tone}`
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {task.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{task.detail}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {task.time}
                  </span>
                </button>
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
          {[42, 55, 48, 70, 62, 84, 92].map((height, i) => (
            <div
              key={`${height}-${i}`}
              className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-violet-400"
              style={{ height: `${height}%`, opacity: 0.45 + i * 0.08 }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-500" aria-hidden />
          <p className="text-xs text-muted-foreground">{done.length} of {tasks.length} tasks done today</p>
        </div>
      </div>
    </div>
  );
}

function QuizDemo() {
  const questions = [
    {
      question: "What does the gradient computed by backpropagation tell us?",
      options: ["How to adjust weights to reduce loss", "The exact labels of the training data", "The number of layers in the network"],
      correct: 0,
    },
    {
      question: "Which activation is most associated with vanishing gradients?",
      options: ["ReLU", "Sigmoid", "Leaky ReLU"],
      correct: 1,
    },
  ];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const question = questions[index];

  function pick(optionIndex: number) {
    if (picked !== null) return;
    setPicked(optionIndex);
    if (optionIndex === question.correct) setScore((value) => value + 1);
  }

  function next() {
    setPicked(null);
    setIndex((current) => Math.min(questions.length - 1, current + 1));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Multiple choice · Question {index + 1} of {questions.length}
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">01:24</span>
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">{question.question}</p>
        <ul className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => {
            const isCorrect = picked !== null && optionIndex === question.correct;
            const isWrongPick = picked === optionIndex && optionIndex !== question.correct;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => pick(optionIndex)}
                  disabled={picked !== null}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    isCorrect
                      ? "border-emerald-300/70 bg-emerald-50 font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : isWrongPick
                        ? "border-red-300/70 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                        : "border-border text-foreground hover:border-brand-300"
                  }`}
                >
                  {isCorrect && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
        {picked !== null && index < questions.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Next question
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Score this session</p>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
          {score}<span className="text-lg text-muted-foreground">/{questions.length}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(score / questions.length) * 100}%` }}
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Wrong answers feed your <span className="font-medium text-foreground">weak-topic profile</span> so
          your next study plan targets them.
        </p>
      </div>
    </div>
  );
}
