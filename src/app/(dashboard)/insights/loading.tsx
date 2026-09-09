import { BarChart3, LineChart, Sparkles, Target } from "lucide-react";

/** Skeleton shown while the /insights route streams. */
export default function InsightsLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading insights">
      <div>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[BarChart3, LineChart, Sparkles, Target].map((Icon, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 flex items-center justify-between">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <Icon className="h-4 w-4 animate-pulse text-muted-foreground" aria-hidden />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-12 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
