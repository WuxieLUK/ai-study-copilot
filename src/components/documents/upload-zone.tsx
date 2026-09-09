"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  MAX_UPLOAD_MB,
  detectFileType,
  sanitizeStorageName,
  validateUploadFile,
} from "@/lib/upload/validate";

/** Map common storage errors to actionable guidance. */
function describeUploadError(message: string): string {
  if (/bucket.*not found/i.test(message)) {
    return "The 'documents' storage bucket does not exist. Apply supabase/migrations/0002_storage_documents.sql in your project.";
  }
  if (/permission|policy|row level security/i.test(message)) {
    return "Upload not allowed. Check the storage policies in supabase/migrations/0002_storage_documents.sql (authenticated users may only write to their own folder).";
  }
  if (/duplicate/i.test(message)) {
    return "A file with this name was already uploaded. Try again.";
  }
  return message;
}

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const pickFile = useCallback((candidate: File | null | undefined) => {
    if (!candidate) return;
    const validationError = validateUploadFile(candidate.name, candidate.size);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setDone(null);
      return;
    }
    setError(null);
    setDone(null);
    setFile(candidate);
  }, []);

  async function runUpload() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    setDone(null);
    try {
      const supabase = createClient();
      if (!supabase) {
        setError(
          "Supabase is not configured. Add the NEXT_PUBLIC_SUPABASE_* variables to your environment to upload.",
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Your session expired — please sign in again.");
        return;
      }

      const fileType = detectFileType(file.name);
      if (!fileType) {
        setError("Unsupported file type.");
        return;
      }

      // Unique key under the caller's own storage folder (RLS-enforced).
      const storagePath = `${user.id}/${crypto.randomUUID()}-${sanitizeStorageName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
        });
      if (uploadError) {
        setError(describeUploadError(uploadError.message));
        return;
      }

      const { error: insertError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          filename: file.name,
          storage_path: storagePath,
          file_type: fileType,
          size_bytes: file.size,
          status: "pending",
        });

      if (insertError) {
        // Roll the orphan object back so we never leak files without rows.
        await supabase.storage.from("documents").remove([storagePath]);
        setError(`Could not save the document: ${insertError.message}`);
        return;
      }

      setFile(null);
      setDone(file.name);
      router.refresh();
    } catch {
      setError("Upload failed unexpectedly. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a study document"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring/60 ${
          isDragging
            ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30"
            : "border-border bg-card hover:border-brand-400/70 hover:bg-muted/40"
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <UploadCloud className="h-5.5 w-5.5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          Drag &amp; drop a file here, or{" "}
          <span className="text-brand-600 dark:text-brand-400">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, Markdown or TXT · up to {MAX_UPLOAD_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.md,.txt,application/pdf,text/markdown,text/plain"
          className="sr-only"
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setError(null);
            }}
            disabled={uploading}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Cancel selection"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={runUpload}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {done && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">{done}</span> uploaded — it will be
            processed into your knowledge base shortly.
          </span>
        </div>
      )}
    </div>
  );
}
