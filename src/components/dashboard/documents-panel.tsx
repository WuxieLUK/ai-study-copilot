import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { FILE_TYPE_ICONS, STATUS_META } from "@/components/documents/meta";
import { Panel } from "@/components/dashboard/panel";
import type { DashboardDocument } from "@/lib/db/types";
import { formatRelativeTime } from "@/lib/utils/format";

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
      icon={FILE_TYPE_ICONS.pdf}
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
          <Link
            href="/documents"
            className="group mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Upload documents
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => {
            const Icon = FILE_TYPE_ICONS[doc.file_type] ?? FILE_TYPE_ICONS.txt;
            const status = STATUS_META[doc.status];
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
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status.badge}`}
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
