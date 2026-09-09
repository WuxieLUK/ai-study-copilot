import { describe, expect, it } from "vitest";

import { aggregateWeakTopics } from "@/lib/quiz/aggregate";
import {
  computeScorePct,
  computeWeightedScorePct,
  isCorrectBool,
  isCorrectSelection,
} from "@/lib/quiz/score";

describe("isCorrectSelection", () => {
  it("is strict about the selected index", () => {
    expect(isCorrectSelection(2, 2)).toBe(true);
    expect(isCorrectSelection(2, 1)).toBe(false);
    expect(isCorrectSelection(2, null)).toBe(false);
    expect(isCorrectSelection(2, undefined)).toBe(false);
    expect(isCorrectSelection(2, 2.5)).toBe(false);
  });
});

describe("isCorrectBool", () => {
  it("requires an exact boolean match", () => {
    expect(isCorrectBool(true, true)).toBe(true);
    expect(isCorrectBool(true, false)).toBe(false);
    expect(isCorrectBool(false, undefined)).toBe(false);
  });
});

describe("computeScorePct / computeWeightedScorePct", () => {
  it("computes and rounds percentages", () => {
    expect(computeScorePct(2, 4)).toBe(50);
    expect(computeScorePct(1, 3)).toBe(33);
    expect(computeScorePct(0, 5)).toBe(0);
    expect(computeScorePct(5, 5)).toBe(100);
    expect(computeScorePct(0, 0)).toBe(0);
    expect(computeWeightedScorePct(2.5, 4)).toBe(63);
  });
});

describe("aggregateWeakTopics", () => {
  it("counts only missed topics, most-missed first", () => {
    const weak = aggregateWeakTopics([
      { topic: "CNN", correct: false },
      { topic: "CNN", correct: false },
      { topic: "RNN", correct: false },
      { topic: "CNN", correct: true },
    ]);
    expect(weak).toEqual([
      { topic: "CNN", missed: 2 },
      { topic: "RNN", missed: 1 },
    ]);
  });

  it("returns [] when everything is correct", () => {
    expect(
      aggregateWeakTopics([
        { topic: "CNN", correct: true },
        { topic: "RNN", correct: true },
      ]),
    ).toEqual([]);
  });

  it("falls back to General for blank topics", () => {
    const weak = aggregateWeakTopics([{ topic: "  ", correct: false }]);
    expect(weak).toEqual([{ topic: "General", missed: 1 }]);
  });
});
