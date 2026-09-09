/**
 * Row types mirroring the Postgres schema (see supabase/migrations).
 * Kept intentionally hand-written and minimal; widen as features land.
 */

export type DocumentFileType = "pdf" | "md" | "txt";

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export type DocumentRow = {
  id: string;
  user_id: string;
  filename: string;
  /** Object key inside the private `documents` storage bucket. */
  storage_path: string;
  file_type: DocumentFileType;
  size_bytes: number;
  status: DocumentStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardDocument = Pick<
  DocumentRow,
  "id" | "filename" | "file_type" | "status" | "created_at"
>;

export type ListDocument = Pick<
  DocumentRow,
  | "id"
  | "filename"
  | "storage_path"
  | "file_type"
  | "size_bytes"
  | "status"
  | "error"
  | "created_at"
>;

/** Everything the dashboard renders in one fetch-friendly snapshot. */
export type DashboardSnapshot = {
  recentDocuments: DashboardDocument[];
  totalDocuments: number;
  readyDocuments: number;
  inFlightDocuments: number;
  failedDocuments: number;
};
