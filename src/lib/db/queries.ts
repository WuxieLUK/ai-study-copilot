import type {
  DashboardDocument,
  DashboardSnapshot,
  DocumentRow,
  ListDocument,
} from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Query helpers. Never throw: on failure (e.g. migration not applied yet)
 * they degrade to empty results so pages can render empty/error guidance.
 */

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  recentDocuments: [],
  totalDocuments: 0,
  readyDocuments: 0,
  inFlightDocuments: 0,
  failedDocuments: 0,
};

export async function getDashboardSnapshot(
  userId: string,
): Promise<DashboardSnapshot> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, filename, file_type, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[dashboard] failed to load documents:", error.message);
      return EMPTY_SNAPSHOT;
    }

    const documents = (data ?? []).map(
      (row) =>
        ({
          id: row.id as string,
          filename: row.filename as string,
          file_type: row.file_type as DocumentRow["file_type"],
          status: row.status as DocumentRow["status"],
          created_at: row.created_at as string,
        }) satisfies DashboardDocument,
    );

    return {
      recentDocuments: documents,
      totalDocuments: documents.length,
      readyDocuments: documents.filter((d) => d.status === "ready").length,
      inFlightDocuments: documents.filter(
        (d) => d.status === "pending" || d.status === "processing",
      ).length,
      failedDocuments: documents.filter((d) => d.status === "error").length,
    };
  } catch (err) {
    console.error("[dashboard] unexpected error loading snapshot:", err);
    return EMPTY_SNAPSHOT;
  }
}

/** Full document list for the /documents page (newest first). */
export async function getDocuments(
  userId: string,
  limit = 100,
): Promise<ListDocument[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select(
        "id, filename, storage_path, file_type, size_bytes, status, error, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[documents] failed to load documents:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      filename: row.filename as string,
      storage_path: row.storage_path as string,
      file_type: row.file_type as ListDocument["file_type"],
      size_bytes: row.size_bytes as number,
      status: row.status as ListDocument["status"],
      error: (row.error as string | null) ?? null,
      created_at: row.created_at as string,
    }));
  } catch (err) {
    console.error("[documents] unexpected error loading documents:", err);
    return [];
  }
}

type ReadyDocument = { id: string; filename: string };

/** Documents that finished processing — pickable as quiz sources. */
export async function getReadyDocuments(userId: string): Promise<ReadyDocument[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, filename")
      .eq("user_id", userId)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[documents] failed to load ready documents:", error.message);
      return [];
    }
    return (data ?? []).map((row) => ({
      id: row.id as string,
      filename: row.filename as string,
    }));
  } catch (err) {
    console.error("[documents] unexpected error:", err);
    return [];
  }
}

/**
 * Samples indexed chunk text (with the owning filename) for quiz generation.
 * Caller pre-filters document ids to the user's ready documents; RLS keeps
 * the query scoped to the signed-in user regardless.
 */
export async function getQuizSourceContext(
  documentIds: string[],
  maxChunks = 40,
): Promise<string> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("document_chunks")
      .select("document_id, content, documents!inner(filename)")
      .in("document_id", documentIds)
      .order("chunk_index")
      .limit(maxChunks);

    if (error) {
      console.error("[quiz] failed to load source chunks:", error.message);
      return "";
    }
    return (data ?? [])
      .map(
        (row) =>
          `--- ${(row.documents as { filename?: string } | null)?.filename ?? "document"} ---\n${row.content as string}`,
      )
      .join("\n\n");
  } catch (err) {
    console.error("[quiz] unexpected error loading context:", err);
    return "";
  }
}

export type QuizSessionSummary = {
  id: string;
  title: string;
  score_pct: number;
  question_count: number;
  correct_count: number;
  weak_topics: { topic: string; missed: number }[];
  created_at: string;
};

type QuizResponseRow = {
  topic: string;
  correct: boolean;
};

/** Quiz history summary (no per-question payload) for dashboards. */
export async function getQuizSessionsSummary(
  userId: string,
  limit = 20,
): Promise<QuizSessionSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quiz_sessions")
      .select(
        "id, title, score_pct, question_count, correct_count, weak_topics, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[quiz] failed to load sessions:", error.message);
      return [];
    }
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      score_pct: row.score_pct as number,
      question_count: row.question_count as number,
      correct_count: row.correct_count as number,
      weak_topics: ((row.weak_topics ?? []) as { topic?: string; missed?: number }[]).map(
        (w) => ({ topic: w.topic ?? "General", missed: Number(w.missed) || 0 }),
      ),
      created_at: row.created_at as string,
    }));
  } catch (err) {
    console.error("[quiz] unexpected error loading sessions:", err);
    return [];
  }
}

/** Quiz history including per-question responses, for analytics. */
export async function getQuizSessionDetails(
  userId: string,
  limit = 50,
): Promise<(QuizSessionSummary & { responses: QuizResponseRow[] })[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[quiz] failed to load session details:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      score_pct: row.score_pct as number,
      question_count: row.question_count as number,
      correct_count: row.correct_count as number,
      weak_topics: ((row.weak_topics ?? []) as { topic?: string; missed?: number }[]).map(
        (w) => ({ topic: w.topic ?? "General", missed: Number(w.missed) || 0 }),
      ),
      created_at: row.created_at as string,
      responses: ((row.responses ?? []) as QuizResponseRow[]).map((r) => ({
        topic: r.topic ?? "General",
        correct: Boolean(r.correct),
      })),
    }));
  } catch (err) {
    console.error("[quiz] unexpected error loading session details:", err);
    return [];
  }
}
