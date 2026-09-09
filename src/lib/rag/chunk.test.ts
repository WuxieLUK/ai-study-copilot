import { describe, expect, it } from "vitest";

import { chunkText } from "@/lib/rag/chunk";

describe("chunkText", () => {
  it("returns [] for empty / whitespace input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n ")).toEqual([]);
  });

  it("keeps short documents as a single chunk", () => {
    expect(chunkText("Hello world")).toEqual(["Hello world"]);
  });

  it("normalizes CRLF and trims", () => {
    expect(chunkText("  a\r\n\r\nb  ")).toEqual(["a\n\nb"]);
  });

  it("splits long text into bounded chunks", () => {
    const text = "word ".repeat(500); // 2500 chars
    const chunks = chunkText(text, { maxChars: 1000, overlapChars: 0 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1000);
    }
    // Content is preserved (minus paragraph-join whitespace).
    expect(chunks.join("")).toContain("word");
  });

  it("keeps paragraphs together when they fit", () => {
    const a = "a".repeat(300);
    const b = "b".repeat(300);
    const chunks = chunkText(`${a}\n\n${b}`, { maxChars: 1000 });
    expect(chunks).toEqual([`${a}\n\n${b}`]);
  });

  it("does not merge paragraphs across the chunk boundary", () => {
    const big = "x".repeat(900);
    const chunks = chunkText(`${big}\n\n${big}`, { maxChars: 1000 });
    expect(chunks).toHaveLength(2);
    expect(chunks[0].length).toBeLessThanOrEqual(1000);
    expect(chunks[1].length).toBeLessThanOrEqual(1000);
    expect(chunks[0]).toContain("x".repeat(900));
    expect(chunks[1]).toContain("x".repeat(900));
  });

  it("hard-cuts a single oversized paragraph with overlap", () => {
    const paragraph = "y".repeat(2500);
    const chunks = chunkText(paragraph, {
      maxChars: 1000,
      overlapChars: 100,
    });
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks[0].length).toBe(1000);
    // Second piece starts 900 chars in, keeping 100 chars of overlap.
    expect(chunks[1]).toBe(paragraph.slice(900, 1900));
    expect(chunks[chunks.length - 1].length).toBeLessThanOrEqual(1000);
  });

  it("obeys custom options passed per call", () => {
    const text = "z".repeat(5000);
    const chunks = chunkText(text, { maxChars: 500, overlapChars: 50 });
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(500);
    }
    expect(chunks.length).toBeGreaterThan(5);
  });
});
