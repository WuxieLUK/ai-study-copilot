import "server-only";

import type { DocumentFileType } from "@/lib/db/types";
import { EmbeddingNotConfiguredError, embedTexts } from "@/lib/rag/embed";
import { chunkText } from "@/lib/rag/chunk";
import { extractText } from "@/lib/rag/extract";
import { createClient } from "@/lib/supabase/server";

export type ProcessOutcome =
  | { status: "ready"; chunkCount: number }
  | { status: "error"; message: string };

const INSERT_BATCH_SIZE = 50;

/**
 * Runs the RAG pipeline for one document owned by `userId`:
 * download → extract text → chunk → embed → upsert chunks → mark ready.
 * Any failure marks the document `error` with a human-readable message.
 */
export async function processDocument(
  userId: string,
  documentId: string,
): Promise<ProcessOutcome> {
  const supabase = await createClient();

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !doc) {
    return { status: "error", message: "Document not found." };
  }

  const now = new Date().toISOString();
  const fail = async (message: string): Promise<ProcessOutcome> => {
    await supabase
      .from("documents")
      .update({ status: "error", error: message, updated_at: now })
      .eq("id", doc.id);
    return { status: "error", message };
  };

  await supabase
    .from("documents")
    .update({ status: "processing", error: null, updated_at: now })
    .eq("id", doc.id);

  try {
    const { data: blob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.storage_path as string);
    if (downloadError || !blob) {
      return await fail(
        `Could not read the stored file (${downloadError?.message ?? "missing object"}).`,
      );
    }

    const content = new Uint8Array(await blob.arrayBuffer());
    const text = await extractText(content, doc.file_type as DocumentFileType);
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return await fail("No indexable content found in this document.");
    }

    const embeddings = await embedTexts(chunks);

    // Idempotent re-index: replace this document's chunks.
    const { error: deleteError } = await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", doc.id);
    if (deleteError) {
      return await fail(`Could not clear old chunks (${deleteError.message}).`);
    }

    const rows = chunks.map((content, index) => ({
      document_id: doc.id,
      chunk_index: index,
      content,
      token_count: Math.ceil(content.length / 4),
      embedding: embeddings[index],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(rows.slice(i, i + INSERT_BATCH_SIZE));
      if (insertError) {
        return await fail(
          `Could not store chunks (${insertError.message}).`,
        );
      }
    }

    await supabase
      .from("documents")
      .update({ status: "ready", error: null, updated_at: now })
      .eq("id", doc.id);

    return { status: "ready", chunkCount: rows.length };
  } catch (err) {
    if (err instanceof EmbeddingNotConfiguredError) {
      return await fail(err.message);
    }
    const message =
      err instanceof Error ? err.message : "Unexpected processing failure.";
    return await fail(message);
  }
}
