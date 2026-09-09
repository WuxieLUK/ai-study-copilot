import { GraduationCap } from "lucide-react";

/** Skeleton shown while the /tutor route streams. */
export default function TutorLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div
        className="flex h-[calc(100vh-11rem)] min-h-[28rem] flex-col rounded-2xl border border-border bg-card"
        aria-busy="true"
        aria-label="Loading tutor"
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center">
            <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <GraduationCap className="h-7 w-7" aria-hidden />
            </span>
            <div className="mt-4 h-4 w-44 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="border-t border-border p-3">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
