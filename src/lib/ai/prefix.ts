/**
 * Embedding text prefixes for models that expect them (E5 family).
 * Pure functions — unit-tested.
 */

export type EmbeddingKind = "query" | "passage";

export function applyEmbeddingPrefix(
  text: string,
  kind: EmbeddingKind,
  enabled: boolean,
): string {
  if (!enabled) return text;
  return `${kind}: ${text}`;
}

export function applyEmbeddingPrefixes(
  texts: string[],
  kind: EmbeddingKind,
  enabled: boolean,
): string[] {
  return texts.map((text) => applyEmbeddingPrefix(text, kind, enabled));
}
