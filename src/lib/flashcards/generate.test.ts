import { describe, expect, it } from "vitest";

import { parseFlashcardDeck } from "@/lib/flashcards/parse";

describe("parseFlashcardDeck", () => {
  it("parses valid cards", () => {
    const deck = parseFlashcardDeck({
      title: "Biology",
      cards: [{ front: "What is ATP?", back: "Energy currency", hint: "adenosine" }],
    });
    expect(deck.title).toBe("Biology");
    expect(deck.cards[0].hint).toBe("adenosine");
  });

  it("rejects missing cards", () => {
    expect(() => parseFlashcardDeck({ title: "Empty" })).toThrow();
  });
});
