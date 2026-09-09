import { UploadCloud } from "lucide-react";

/** Skeleton shown while the /documents route streams. */
export default function DocumentsLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading documents">
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="h-5.5 w-5.5 animate-pulse" aria-hidden />
        </span>
        <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-px overflow-hidden rounded-2xl border border-border bg-card">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
