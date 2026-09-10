import { describe, expect, it } from "vitest";

import { applyEmbeddingPrefix, applyEmbeddingPrefixes } from "@/lib/ai/prefix";

describe("applyEmbeddingPrefix", () => {
  it("adds the e5 prefix when enabled", () => {
    expect(applyEmbeddingPrefix("backprop", "query", true)).toBe(
      "query: backprop",
    );
    expect(applyEmbeddingPrefix("chunk text", "passage", true)).toBe(
      "passage: chunk text",
    );
  });

  it("leaves text untouched when disabled", () => {
    expect(applyEmbeddingPrefix("backprop", "query", false)).toBe("backprop");
  });
});

describe("applyEmbeddingPrefixes", () => {
  it("maps a batch", () => {
    expect(applyEmbeddingPrefixes(["a", "b"], "passage", true)).toEqual([
      "passage: a",
      "passage: b",
    ]);
    expect(applyEmbeddingPrefixes(["a"], "query", false)).toEqual(["a"]);
  });
});
