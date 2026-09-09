import { Target } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";
import { ScoreBadge } from "@/components/insights/insights-views";
import type { QuizSessionSummary } from "@/lib/db/queries";

type QuizPanelProps = {
  sessions: QuizSessionSummary[];
};

export function QuizPanel({ sessions }: QuizPanelProps) {
  const hasScores = sessions.length > 0;
  const average =
    hasScores
      ? Math.round(
          sessions.reduce((sum, s) => sum + s.score_pct, 0) / sessions.length,
        )
      : null;

  return (
    <Panel
      title="Quiz scores"
      description={
        hasScores && average !== null ? `Average ${average}%` : "Accuracy over time"
      }
      icon={Target}
    >
      {!hasScores ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            No quizzes yet
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Once you have ready documents, generate a quiz and your scores
            will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center gap-3">
              <span className="w-12 shrink-0">
                <ScoreBadge score={session.score_pct} />
              </span>
              <span
                className="min-w-0 flex-1 truncate text-sm text-foreground"
                title={session.title}
              >
                {session.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
