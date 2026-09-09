/** Deterministic scoring helpers (pure, unit-tested). */

export function isCorrectSelection(
  correctIndex: number,
  selectedIndex: number | null | undefined,
): boolean {
  return (
    typeof selectedIndex === "number" &&
    Number.isInteger(selectedIndex) &&
    selectedIndex === correctIndex
  );
}

export function isCorrectBool(
  correct: boolean,
  selected: boolean | null | undefined,
): boolean {
  return typeof selected === "boolean" && selected === correct;
}

/** Round percentage to a whole number in 0..100. */
export function computeScorePct(correctCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correctCount / total) * 100);
}

export function computeWeightedScorePct(totalScore: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((totalScore / total) * 100);
}
