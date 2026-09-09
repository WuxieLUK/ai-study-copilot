import type { TopicStat } from "@/lib/analytics/insights";
import type { QuizSessionSummary } from "@/lib/db/queries";

/** Shared colored score pill used across analytics surfaces. */
export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300"
      : score >= 60
        ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300"
        : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset ${tone}`}
    >
      {score}%
    </span>
  );
}

/** Accuracy bar list for strong / weak topics. */
export function TopicBarList({
  topics,
  tone,
  emptyMessage,
}: {
  topics: TopicStat[];
  tone: "strong" | "weak";
  emptyMessage: string;
}) {
  if (topics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  const color =
    tone === "strong"
      ? "bg-emerald-500"
      : "bg-amber-500";
  return (
    <ul className="space-y-3">
      {topics.map((topic) => (
        <li key={topic.topic}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-foreground">
              {topic.topic}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {topic.correctCount}/{topic.attempts} correct ·{" "}
              {Math.round(topic.accuracy * 100)}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(topic.accuracy * 100)}
            aria-label={`Accuracy for ${topic.topic}`}
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${Math.round(topic.accuracy * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Horizontal score history rows (recent quizzes). */
export function ScoreHistory({
  sessions,
}: {
  sessions: QuizSessionSummary[];
}) {
  if (sessions.length === 0) return null;
  return (
    <ul className="space-y-2.5">
      {sessions.map((session) => (
        <li key={session.id} className="flex items-center gap-3">
          <span className="w-14 shrink-0">
            <ScoreBadge score={session.score_pct} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {session.title}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {session.question_count} questions
          </span>
        </li>
      ))}
    </ul>
  );
}
