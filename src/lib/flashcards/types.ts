export type Flashcard = {
  id: string;
  front: string;
  back: string;
  hint?: string;
};

export type FlashcardDeck = {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
};
