import { describe, expect, it } from "vitest";

import type { SearchChunk } from "@/lib/rag/search";
import {
  CONTEXT_MAX_CHARS,
  formatContextBlock,
  sanitizeHistory,
  sanitizeQuestion,
} from "@/lib/tutor/format";

const chunk = (index: number, content: string): SearchChunk => ({
  document_id: `doc-${index}`,
  filename: "notes.md",
  chunk_index: index,
  content,
  similarity: 0.9 - index * 0.01,
});

describe("sanitizeQuestion", () => {
  it("collapses whitespace and trims", () => {
    expect(sanitizeQuestion("  what   is   backprop?  ")).toBe(
      "what is backprop?",
    );
  });

  it("returns empty for blank input", () => {
    expect(sanitizeQuestion("   ")).toBe("");
  });

  it("bounds over-long questions", () => {
    const long = "a".repeat(5000);
    expect(sanitizeQuestion(long)).toHaveLength(2000);
  });
});

describe("formatContextBlock", () => {
  it("numbers sources starting at 1", () => {
    const block = formatContextBlock([
      chunk(0, "first"),
      chunk(1, "second"),
    ]);
    expect(block).toBe("[1] first\n\n[2] second");
  });

  it("trims content", () => {
    const block = formatContextBlock([chunk(0, "  padded  ")]);
    expect(block).toBe("[1] padded");
  });

  it("caps the total block length but keeps the head", () => {
    const big = "x".repeat(3200);
    const block = formatContextBlock([chunk(0, big), chunk(1, big)]);
    // One 3200-char chunk plus both markers already exceeds the cap.
    expect(block.length).toBeLessThanOrEqual(CONTEXT_MAX_CHARS);
    expect(block).toContain("[1]");
    expect(block).not.toContain("[2]");
  });
});

describe("sanitizeHistory", () => {
  it("returns [] for non-array input", () => {
    expect(sanitizeHistory(null)).toEqual([]);
    expect(sanitizeHistory("nope")).toEqual([]);
  });

  it("keeps only well-formed messages in order", () => {
    const history = sanitizeHistory([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
      { role: "system", content: "ignored" },
      { role: "user", content: 42 },
      null,
    ]);
    expect(history).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
  });

  it("drops empty messages and caps the count", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      role: "user",
      content: `m${i}`,
    }));
    const history = sanitizeHistory(many);
    expect(history.length).toBe(10);
  });
});
