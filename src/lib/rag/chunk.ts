/**
 * Pure text chunking for retrieval. No I/O — unit-testable.
 *
 * Strategy: greedy paragraph packing, hard-cutting single paragraphs that
 * exceed `maxChars` with a sliding window that keeps `overlapChars` of
 * context between consecutive pieces.
 */

export type ChunkOptions = {
  /** Soft upper bound for a chunk (characters). */
  maxChars?: number;
  /** Context carried over between hard-cut pieces. */
  overlapChars?: number;
};

export const DEFAULT_CHUNK_OPTIONS: Required<ChunkOptions> = {
  maxChars: 1400,
  overlapChars: 150,
};

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Hard-cuts one oversized paragraph into overlapping pieces. */
function hardCut(piece: string, maxChars: number, overlapChars: number): string[] {
  if (piece.length <= maxChars) return [piece];
  const parts: string[] = [];
  const step = Math.max(1, maxChars - overlapChars);
  for (let i = 0; i < piece.length; i += step) {
    parts.push(piece.slice(i, i + maxChars));
  }
  return parts;
}

export function chunkText(text: string, options?: ChunkOptions): string[] {
  const { maxChars, overlapChars } = {
    ...DEFAULT_CHUNK_OPTIONS,
    ...options,
  };

  const normalized = normalize(text);
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of splitParagraphs(normalized)) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    for (const part of hardCut(paragraph, maxChars, overlapChars)) {
      if (part) chunks.push(part);
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
