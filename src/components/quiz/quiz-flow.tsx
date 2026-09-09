"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  CircleAlert,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import type { QuizQuestion, QuizResult } from "@/lib/quiz/types";

type ReadyDocument = { id: string; filename: string };
type QuizDraft = { title: string; questions: QuizQuestion[] };

type Stage = "setup" | "generating" | "taking" | "grading" | "results";

type Answers = Record<string, { index?: number; bool?: boolean; text?: string }>;

const QUESTION_TYPE_LABEL: Record<QuizQuestion["type"], string> = {
  multiple_choice: "Multiple choice",
  true_false: "True / False",
  short_answer: "Short answer",
};

export function QuizFlow({ documents }: { documents: ReadyDocument[] }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    documents.map((d) => d.id),
  );
  const [questionCount, setQuestionCount] = useState(6);
  const [draft, setDraft] = useState<QuizDraft | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<(QuizResult & { sessionId: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = selectedIds.length > 0 && documents.length > 0;

  async function generate() {
    if (!canGenerate || stage !== "setup") return;
    setStage("generating");
    setError(null);
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: selectedIds, questionCount }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Could not generate the quiz.");
        setStage("setup");
        return;
      }
      setDraft(data as QuizDraft);
      setAnswers({});
      setStage("taking");
    } catch {
      setError("Network error while generating the quiz.");
      setStage("setup");
    }
  }

  async function submit() {
    if (!draft || stage !== "taking") return;
    const unanswered = draft.questions.filter(
      (q) =>
        q.type !== "short_answer" &&
        !(
          (q.type === "multiple_choice" && answers[q.id]?.index !== undefined) ||
          (q.type === "true_false" && answers[q.id]?.bool !== undefined)
        ),
    );
    if (unanswered.length > 0) {
      setError(
        `Please answer every question before submitting (${unanswered.length} left).`,
      );
      return;
    }

    setStage("grading");
    setError(null);
    try {
      const response = await fetch("/api/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          documentIds: selectedIds,
          questions: draft.questions,
          answers: draft.questions.map((q) => {
            const a = answers[q.id] ?? {};
            return {
              questionId: q.id,
              selectedIndex: a.index ?? null,
              selectedBool: a.bool ?? null,
              text: a.text?.trim() || null,
            };
          }),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Could not grade the quiz.");
        setStage("taking");
        return;
      }
      setResult(data);
      setStage("results");
      router.refresh();
    } catch {
      setError("Network error while grading.");
      setStage("taking");
    }
  }

  function reset() {
    setDraft(null);
    setResult(null);
    setAnswers({});
    setError(null);
    setStage("setup");
  }

  return (
    <div className="space-y-5">
      {stage === "setup" && (
        <SetupScreen
          documents={documents}
          selectedIds={selectedIds}
          onToggle={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          questionCount={questionCount}
          onCountChange={setQuestionCount}
          onGenerate={generate}
          canGenerate={canGenerate}
          error={error}
        />
      )}

      {(stage === "generating" || stage === "grading") && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" aria-hidden />
          <p className="mt-4 font-medium text-foreground">
            {stage === "generating"
              ? "Writing questions from your materials…"
              : "Grading your answers…"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stage === "generating"
              ? "This usually takes a few seconds."
              : "Short answers are reviewed individually."}
          </p>
        </div>
      )}

      {stage === "taking" && draft && (
        <TakingScreen
          draft={draft}
          answers={answers}
          onChange={setAnswers}
          onSubmit={submit}
          onCancel={reset}
          error={error}
        />
      )}

      {stage === "results" && result && (
        <ResultsScreen result={result} onNew={reset} />
      )}
    </div>
  );
}

function SetupScreen({
  documents,
  selectedIds,
  onToggle,
  questionCount,
  onCountChange,
  onGenerate,
  canGenerate,
  error,
}: {
  documents: ReadyDocument[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  questionCount: number;
  onCountChange: (n: number) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  error: string | null;
}) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <Target className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="mt-3 font-medium text-foreground">No ready documents</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          Upload a PDF, Markdown file or notes and wait until it is indexed
          (status Ready). Then you can generate quizzes from it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-semibold text-foreground">Pick your sources</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Questions will be generated from these processed documents.
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {documents.map((doc) => {
          const checked = selectedIds.includes(doc.id);
          return (
            <li key={doc.id}>
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                  checked
                    ? "border-brand-400/70 bg-brand-50/60 dark:bg-brand-950/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(doc.id)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {doc.filename}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            Question count
          </span>
          <select
            value={questionCount}
            onChange={(e) => onCountChange(Number(e.target.value))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {[3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Generate quiz
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function TakingScreen({
  draft,
  answers,
  onChange,
  onSubmit,
  onCancel,
  error,
}: {
  draft: QuizDraft;
  answers: Answers;
  onChange: (next: Answers) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  const answeredCount = draft.questions.filter((q) => {
    const a = answers[q.id];
    if (q.type === "multiple_choice") return a?.index !== undefined;
    if (q.type === "true_false") return a?.bool !== undefined;
    return (a?.text ?? "").trim().length > 0;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-foreground">
            {draft.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{draft.questions.length} answered
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <ol className="space-y-4">
        {draft.questions.map((question, index) => (
          <li
            key={question.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <QuestionCard
              question={question}
              index={index}
              answer={answers[question.id] ?? {}}
              onChange={(patch) =>
                onChange({ ...answers, [question.id]: patch })
              }
            />
          </li>
        ))}
      </ol>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Submit quiz
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: {
  question: QuizQuestion;
  index: number;
  answer: Answers[string];
  onChange: (patch: Answers[string]) => void;
}) {
  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Q{index + 1}
        </span>
        <span>{QUESTION_TYPE_LABEL[question.type]}</span>
        <span className="text-muted-foreground/70">· {question.topic}</span>
      </p>
      <p className="mt-2 font-medium text-foreground">{question.question}</p>

      {question.type === "multiple_choice" && (
        <ul className="mt-3 space-y-2">
          {(question.options ?? []).map((option, optionIndex) => (
            <li key={optionIndex}>
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                  answer?.index === optionIndex
                    ? "border-brand-400/70 bg-brand-50/60 dark:bg-brand-950/30"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={answer?.index === optionIndex}
                  onChange={() => onChange({ index: optionIndex })}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-foreground">{option}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {question.type === "true_false" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onChange({ bool: value })}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                answer?.bool === value
                  ? "border-brand-400/70 bg-brand-50/60 text-foreground dark:bg-brand-950/30"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {value ? "True" : "False"}
            </button>
          ))}
        </div>
      )}

      {question.type === "short_answer" && (
        <textarea
          value={answer?.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={4}
          placeholder="Write your answer…"
          className="mt-3 w-full resize-y rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      )}
    </div>
  );
}

function ResultsScreen({
  result,
  onNew,
}: {
  result: QuizResult & { sessionId: string };
  onNew: () => void;
}) {
  const passed = result.scorePct >= 60;
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className={`px-6 py-6 text-center ${passed ? "bg-emerald-50/60 dark:bg-emerald-950/30" : "bg-amber-50/60 dark:bg-amber-950/30"}`}
        >
          <p className="text-5xl font-bold tabular-nums text-foreground">
            {result.scorePct}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.correctCount} of {result.questionCount} correct ·{" "}
            {result.title}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {passed
              ? "Nice work — solid understanding!"
              : "Good effort — review the misses below and retry."}
          </p>
        </div>

        {result.weakTopics.length > 0 && (
          <div className="border-t border-border px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Weak topics to review
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.weakTopics.map((weak) => (
                <span
                  key={weak.topic}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/50 dark:text-amber-300"
                >
                  <X className="h-3 w-3" aria-hidden />
                  {weak.topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ol className="space-y-4">
        {result.questions.map((q, index) => {
          const correct = q.correct;
          return (
            <li
              key={q.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm ${
                correct ? "border-emerald-500/30" : "border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Q{index + 1} · {QUESTION_TYPE_LABEL[q.type]} · {q.topic}
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {q.question}
                  </p>
                </div>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    correct
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {correct ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <X className="h-4 w-4" aria-hidden />
                  )}
                </span>
              </div>

              {q.type === "short_answer" ? (
                q.feedback && (
                  <p className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-foreground">
                    {q.feedback}
                  </p>
                )
              ) : (
                <>
                  {!correct && q.correctAnswerText && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Correct answer:{" "}
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {q.correctAnswerText}
                      </span>
                    </p>
                  )}
                </>
              )}

              {q.explanation && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Take another quiz
        </button>
      </div>
    </div>
  );
}
