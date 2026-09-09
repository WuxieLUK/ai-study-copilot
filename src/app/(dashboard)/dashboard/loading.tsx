import { BookOpenCheck, FileText, Sparkles, Target } from "lucide-react";

/** Skeleton shown while the (dashboard) route streams. */
export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PanelSkeleton icon={FileText} wide />
          <PanelSkeleton icon={Sparkles} wide />
        </div>
        <div className="space-y-5">
          <PanelSkeleton icon={BookOpenCheck} />
          <PanelSkeleton icon={Target} />
        </div>
      </div>
    </div>
  );
}

function PanelSkeleton({
  icon: Icon,
  wide = false,
}: {
  icon: typeof FileText;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${wide ? "min-h-56" : "min-h-44"}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
