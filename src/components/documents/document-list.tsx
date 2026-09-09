"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Loader2, RotateCw, Trash2, XCircle } from "lucide-react";

import { FILE_TYPE_ICONS, STATUS_META } from "@/components/documents/meta";
import type { ListDocument } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatRelativeTime } from "@/lib/utils/format";

type DocumentListProps = {
  documents: ListDocument[];
};

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(doc: ListDocument) {
    if (deletingId) return;
    setDeletingId(doc.id);
    setError(null);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }
      // Best-effort object removal (it may already be gone).
      await supabase.storage.from("documents").remove([doc.storage_path]);
      const { error: rowError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);
      if (rowError) {
        setError(`Could not delete the document: ${rowError.message}`);
        return;
      }
      router.refresh();
    } catch {
      setError("Delete failed unexpectedly. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  /** Retries RAG processing for a failed / queued document. */
  async function handleReprocess(doc: ListDocument) {
    if (processingId) return;
    setProcessingId(doc.id);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${doc.id}/process`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as {
        status?: string;
        message?: string;
      } | null;
      if (!response.ok) {
        setError(data?.message ?? "Processing failed.");
      }
      router.refresh();
    } catch {
      setError("Processing failed unexpectedly. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="h-5.5 w-5.5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          No documents yet
        </p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Upload your first PDF, Markdown file or notes above — the copilot
          will process them and start building your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {documents.map((doc) => {
          const Icon = FILE_TYPE_ICONS[doc.file_type] ?? FILE_TYPE_ICONS.txt;
          const status = STATUS_META[doc.status];
          const isDeleting = deletingId === doc.id;
          return (
            <li
              key={doc.id}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-foreground"
                  title={doc.filename}
                >
                  {doc.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.file_type.toUpperCase()} · {formatBytes(doc.size_bytes)}{" "}
                  · {formatRelativeTime(doc.created_at)}
                  {doc.status === "error" && doc.error
                    ? ` · ${doc.error}`
                    : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status.badge}`}
              >
                {status.label}
              </span>
              {(doc.status === "error" || doc.status === "pending") && (
                <button
                  type="button"
                  onClick={() => handleReprocess(doc)}
                  disabled={processingId !== null}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50 dark:hover:bg-brand-950/40"
                  aria-label={`Reprocess ${doc.filename}`}
                  title="Retry processing"
                >
                  {processingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RotateCw className="h-4 w-4" aria-hidden />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                disabled={isDeleting || processingId === doc.id}
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
                aria-label={`Delete ${doc.filename}`}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
