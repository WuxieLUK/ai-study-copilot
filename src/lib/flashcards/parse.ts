import type { Flashcard } from "@/lib/flashcards/types";

const MAX_CARDS = 20;

export function parseFlashcardDeck(raw: unknown): {
  title: string;
  cards: Omit<Flashcard, "id">[];
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Flashcard response is not an object.");
  }
  const root = raw as Record<string, unknown>;
  if (!Array.isArray(root.cards) || root.cards.length === 0) {
    throw new Error("Flashcard response contains no cards.");
  }

  const cards = root.cards.slice(0, MAX_CARDS).map((card, index) => {
    if (!card || typeof card !== "object") {
      throw new Error(`Card ${index + 1} is invalid.`);
    }
    const item = card as Record<string, unknown>;
    const front = typeof item.front === "string" ? item.front.trim() : "";
    const back = typeof item.back === "string" ? item.back.trim() : "";
    if (!front || !back) {
      throw new Error(`Card ${index + 1} needs both front and back text.`);
    }
    const hint =
      typeof item.hint === "string" && item.hint.trim()
        ? item.hint.trim().slice(0, 240)
        : undefined;
    return { front: front.slice(0, 320), back: back.slice(0, 600), hint };
  });

  const title =
    typeof root.title === "string" && root.title.trim()
      ? root.title.trim().slice(0, 160)
      : "Study flashcards";

  return { title, cards };
}
