import type { DocumentFileType } from "@/lib/db/types";

/**
 * Upload rules for study materials. Pure functions — no I/O — so they are
 * fully unit-testable. Enforcement is client-side UX; server-side limits
 * come with the processing pipeline in Phase 5.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

export const ALLOWED_EXTENSIONS: DocumentFileType[] = ["pdf", "md", "txt"];

export const UPLOAD_ERRORS = {
  TOO_LARGE: `File is larger than ${MAX_UPLOAD_MB} MB. Split it or upload a smaller file.`,
  BAD_TYPE:
    "Unsupported file type. Upload PDF, Markdown (.md) or plain text (.txt).",
  EMPTY: "File is empty.",
  NAME: "File name is missing.",
} as const;

export function detectFileType(filename: string): DocumentFileType | null {
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return null;
  const ext = filename.slice(dot + 1).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext as DocumentFileType)
    ? (ext as DocumentFileType)
    : null;
}

/** Returns an error message or `null` when the file may be uploaded. */
export function validateUploadFile(
  filename: string,
  sizeBytes: number,
): string | null {
  if (!filename.trim()) return UPLOAD_ERRORS.NAME;
  const type = detectFileType(filename);
  if (!type) return UPLOAD_ERRORS.BAD_TYPE;
  if (sizeBytes <= 0) return UPLOAD_ERRORS.EMPTY;
  if (sizeBytes > MAX_UPLOAD_BYTES) return UPLOAD_ERRORS.TOO_LARGE;
  return null;
}

/**
 * Turns a user-supplied file name into a safe storage-key fragment:
 * strips directory components and control characters. Display names keep
 * the original filename; only storage keys use this.
 */
export function sanitizeStorageName(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned || "document";
}
