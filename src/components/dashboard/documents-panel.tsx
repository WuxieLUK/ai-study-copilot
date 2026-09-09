import { FileText, File as FileMd, FileCode2, Inbox } from "lucide-react";

import type { DashboardDocument } from "@/lib/db/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { Panel } from "@/components/dashboard/panel";

const FILE_ICONS = {
  pdf: FileText,
  md: FileMd,
  txt: FileCode2,
} as const;

const STATUS_STYLES: Record<
  DashboardDocument["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Queued",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300",
  },
  processing: {
    label: "Processing",
    className:
      "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-300",
  },
  ready: {
    label: "Ready",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  error: {
    label: "Failed",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300",
  },
};

export function DocumentsPanel({
  documents,
}: {
  documents: DashboardDocument[];
}) {
  const hasDocuments = documents.length > 0;

  return (
    <Panel
      title="Recent documents"
      description={hasDocuments ? "Your latest uploads" : undefined}
      icon={FileText}
    >
      {!hasDocuments ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">
            No documents yet
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Upload a PDF, Markdown file or notes and your copilot will turn it
            into summaries, quizzes and a personal tutor.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => {
            const Icon = FILE_ICONS[doc.file_type] ?? FileText;
            const status = STATUS_STYLES[doc.status];
            return (
              <li
                key={doc.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(doc.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status.className}`}
                >
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
