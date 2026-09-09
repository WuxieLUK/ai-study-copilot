import type { SearchChunk } from "@/lib/rag/search";

export type TutorRole = "user" | "assistant";

export type TutorHistoryMessage = {
  role: TutorRole;
  content: string;
};

export const QUESTION_MAX_LENGTH = 2000;
export const HISTORY_MAX_MESSAGES = 10;
export const CONTEXT_MAX_CHARS = 6000;

/** Trims and bounds a free-text question before it reaches any API. */
export function sanitizeQuestion(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return trimmed.slice(0, QUESTION_MAX_LENGTH);
}

/**
 * Renders retrieved chunks as a numbered context block for the model.
 * Each chunk becomes "[n] {content}"; the block is trimmed from the start
 * so the most relevant material always survives the length cap.
 */
export function formatContextBlock(chunks: SearchChunk[]): string {
  const parts = chunks.map(
    (chunk, index) => `[${index + 1}] ${chunk.content.trim()}`,
  );

  let block = "";
  for (const part of parts) {
    if (block.length + part.length + 2 > CONTEXT_MAX_CHARS) break;
    block = block ? `${block}\n\n${part}` : part;
  }
  return block;
}

/** Bounds chat history to the most recent N well-formed messages. */
export function sanitizeHistory(
  history: unknown,
): TutorHistoryMessage[] {
  if (!Array.isArray(history)) return [];

  const cleaned: TutorHistoryMessage[] = [];
  for (const item of history) {
    if (!item || typeof item !== "object") continue;
    const record = item as { role?: unknown; content?: unknown };
    if (record.role !== "user" && record.role !== "assistant") continue;
    if (typeof record.content !== "string") continue;
    const content = record.content.replace(/\s+/g, " ").trim().slice(0, 4000);
    if (!content) continue;
    cleaned.push({ role: record.role, content });
    if (cleaned.length >= HISTORY_MAX_MESSAGES) break;
  }
  return cleaned;
}
