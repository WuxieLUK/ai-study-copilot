import { createClient } from "@/lib/supabase/server";

export type SearchChunk = {
  document_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

/** Cosine similarity floor below which a chunk is considered irrelevant. */
export const MIN_SIMILARITY = 0.68;
export const DEFAULT_MATCH_COUNT = 5;

type MatchRow = {
  document_id: unknown;
  filename: unknown;
  chunk_index: unknown;
  content: unknown;
  similarity: number;
};

/**
 * Semantic search over the caller's document chunks (RLS-backed RPC).
 * Never throws — on error returns an empty result so the tutor can tell the
 * user there is no context rather than crash.
 */
export async function searchChunks(
  embedding: number[],
  options?: { limit?: number; minSimilarity?: number },
): Promise<SearchChunk[]> {
  const { limit = DEFAULT_MATCH_COUNT, minSimilarity = MIN_SIMILARITY } =
    options ?? {};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) {
      console.error("[search] match_documents failed:", error.message);
      return [];
    }

    return ((data ?? []) as MatchRow[])
      .filter((row) => row.similarity >= minSimilarity)
      .map((row) => ({
        document_id: row.document_id as string,
        filename: row.filename as string,
        chunk_index: row.chunk_index as number,
        content: row.content as string,
        similarity: row.similarity,
      }));
  } catch (err) {
    console.error("[search] unexpected error:", err);
    return [];
  }
}
