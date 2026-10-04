"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";

import type { PlanTaskType, StudyPlan } from "@/lib/study-plan/types";

type PlanState =
  | { status: "idle"; error?: string }
  | { status: "loading"; error?: string }
  | { status: "ready"; plan: StudyPlan; error?: string };

const DAY_OPTIONS = [3, 5, 7];

const TASK_META: Record<
  PlanTaskType,
  { label: string; icon: typeof BookOpen; tone: string }
> = {
  read: { label: "Read", icon: BookOpen, tone: "text-sky-600 dark:text-sky-400" },
  recall: { label: "Recall", icon: Brain, tone: "text-violet-600 dark:text-violet-400" },
  practice: { label: "Practice", icon: PenLine, tone: "text-brand-600 dark:text-brand-400" },
  teach: { label: "Teach", icon: WandSparkles, tone: "text-emerald-600 dark:text-emerald-400" },
  review: { label: "Review", icon: RefreshCw, tone: "text-amber-600 dark:text-amber-400" },
};

export function StudyPlanPanel() {
  const [state, setState] = useState<PlanState>({ status: "idle" });
  const [days, setDays] = useState(5);
  const [goal, setGoal] = useState("");

  const totalMinutes = useMemo(
    () =>
      state.status === "ready"
        ? state.plan.days.reduce((sum, day) => sum + day.minutes, 0)
        : 0,
    [state],
  );

  async function generate() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ days, goal }),
      });
      const data = (await response.json().catch(() => null)) as
        | StudyPlan
        | { error?: { message?: string } }
        | null;

      if (!response.ok || !data || "error" in data) {
        const message =
          data && "error" in data && data.error?.message
            ? data.error.message
            : "Could not generate a plan. Please try again.";
        setState({ status: "idle", error: message });
        return;
      }
      setState({ status: "ready", plan: data as StudyPlan });
    } catch {
      setState({
        status: "idle",
        error: "Network error while generating the plan.",
      });
    }
  }

  if (state.status === "ready") {
    return (
      <PlanView
        plan={state.plan}
        totalMinutes={totalMinutes}
        onReset={() => setState({ status: "idle" })}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Personalized study plan
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Stop guessing what to study next.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your plan is built from the documents you uploaded and the quiz
            topics you missed, then sequenced like a coach would sequence it:
            learn, recall, practice, teach, review.
          </p>

          {state.status === "idle" && state.error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
            >
              {state.error}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Plan length
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DAY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  days === option
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                    : "border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground"
                }`}
              >
                {option} days
              </button>
            ))}
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your goal <span className="normal-case">(optional)</span>
          </label>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={3}
            placeholder="e.g. Pass my neural networks exam in two weeks"
            className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />

          <button
            type="button"
            onClick={generate}
            disabled={state.status === "loading"}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Designing your plan…
              </>
            ) : (
              <>
                <WandSparkles className="h-4 w-4" aria-hidden />
                Generate my plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanView({
  plan,
  totalMinutes,
  onReset,
}: {
  plan: StudyPlan;
  totalMinutes: number;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {plan.days.length}-day plan
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {plan.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {plan.overview}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-center">
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {Math.round(totalMinutes / 60 * 10) / 10}h
              </p>
              <p className="text-[11px] text-muted-foreground">total focus</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {plan.weakTopicActions.length > 0 && (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <Target className="h-4 w-4" aria-hidden />
            Recovery actions
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {plan.weakTopicActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-sm text-amber-900/90 dark:text-amber-200/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="relative space-y-5">
        {plan.days.map((day, index) => (
          <li key={`${day.day}-${day.title}`} className="animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm card-hover">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                    {day.day}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{day.title}</h3>
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {day.minutes} min
                </span>
              </div>

              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {day.tasks.map((task) => {
                  const meta = TASK_META[task.type];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={`${task.title}-${task.minutes}`}
                      className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3.5"
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background ${meta.tone}`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {task.minutes}m
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
