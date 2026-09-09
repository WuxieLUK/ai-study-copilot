import { BookOpenCheck } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";

type ProgressPanelProps = {
  readyDocuments: number;
  inFlightDocuments: number;
  failedDocuments: number;
  totalDocuments: number;
};

export function ProgressPanel({
  readyDocuments,
  inFlightDocuments,
  failedDocuments,
  totalDocuments,
}: ProgressPanelProps) {
  const pct = totalDocuments === 0 ? 0 : Math.round((readyDocuments / totalDocuments) * 100);

  return (
    <Panel
      title="Study progress"
      description="Knowledge base readiness"
      icon={BookOpenCheck}
    >
      <div className="flex flex-col justify-between gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            {totalDocuments === 0 ? "—" : `${pct}%`}
          </span>
          <span className="text-xs text-muted-foreground">
            {readyDocuments}/{totalDocuments} documents ready
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Knowledge base readiness"
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Processing</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {inFlightDocuments}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Failed</dt>
            <dd
              className={`mt-0.5 font-medium ${
                failedDocuments > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
              }`}
            >
              {failedDocuments}
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}
