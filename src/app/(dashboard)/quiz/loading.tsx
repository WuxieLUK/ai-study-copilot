import { Target } from "lucide-react";

/** Skeleton shown while the /quiz route streams. */
export default function QuizLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div
        className="rounded-2xl border border-border bg-card p-6"
        aria-busy="true"
        aria-label="Loading quiz"
      >
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 animate-pulse text-muted-foreground" aria-hidden />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
