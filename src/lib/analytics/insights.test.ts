import { describe, expect, it } from "vitest";

import {
  aggregateWeakTopicsAcrossSessions,
  computeInsights,
  computeTopicStats,
} from "@/lib/analytics/insights";
import type { QuizSessionLike } from "@/lib/analytics/insights";

const session = (
  id: string,
  score: number,
  responses: { topic: string; correct: boolean }[],
): QuizSessionLike => ({
  id,
  title: `Quiz ${id}`,
  score_pct: score,
  created_at: `2026-09-0${id}T10:00:00Z`,
  responses: responses.map((r) => ({ topic: r.topic, correct: r.correct })),
});

describe("computeTopicStats", () => {
  it("aggregates attempts and correct counts per topic", () => {
    const stats = computeTopicStats([
      session("1", 50, [
        { topic: "RNN", correct: false },
        { topic: "CNN", correct: true },
      ]),
      session("2", 100, [{ topic: "RNN", correct: true }]),
    ]);
    const rnn = stats.find((t) => t.topic === "RNN");
    const cnn = stats.find((t) => t.topic === "CNN");
    expect(rnn).toEqual({
      topic: "RNN",
      attempts: 2,
      correctCount: 1,
      accuracy: 0.5,
    });
    expect(cnn?.accuracy).toBe(1);
  });

  it("returns [] for empty sessions and defaults blank topics", () => {
    expect(computeTopicStats([])).toEqual([]);
    const stats = computeTopicStats([
      session("1", 0, [{ topic: " ", correct: false }]),
    ]);
    expect(stats[0].topic).toBe("General");
  });
});

describe("computeInsights", () => {
  it("computes averages and best/last scores", () => {
    const insights = computeInsights([session("1", 50, []), session("2", 90, [])]);
    expect(insights.sessionCount).toBe(2);
    expect(insights.averageScore).toBe(70);
    expect(insights.bestScore).toBe(90);
    expect(insights.lastScore).toBe(90);
  });

  it("returns zeros for empty history", () => {
    const insights = computeInsights([]);
    expect(insights.sessionCount).toBe(0);
    expect(insights.averageScore).toBe(0);
    expect(insights.lastScore).toBeNull();
    expect(insights.weakTopics).toEqual([]);
    expect(insights.strongTopics).toEqual([]);
  });

  it("splits strong and weak topics by threshold", () => {
    const insights = computeInsights([
      session("1", 40, [
        { topic: "RNN", correct: false },
        { topic: "Transformer", correct: true },
      ]),
      session("2", 60, [
        { topic: "RNN", correct: false },
        { topic: "Transformer", correct: true },
      ]),
    ]);
    expect(insights.weakTopics.map((t) => t.topic)).toEqual(["RNN"]);
    expect(insights.strongTopics.map((t) => t.topic)).toEqual(["Transformer"]);
  });

  it("keeps the last eight scores for a mini history", () => {
    const sessions = Array.from({ length: 10 }, (_, i) =>
      session(String(i + 1), 50, []),
    );
    expect(computeInsights(sessions).recentScores).toHaveLength(8);
  });
});

describe("aggregateWeakTopicsAcrossSessions", () => {
  it("merges weak topics across sessions sorted by misses", () => {
    const merged = aggregateWeakTopicsAcrossSessions([
      { weak_topics: [{ topic: "RNN", missed: 2 }, { topic: "CNN", missed: 1 }] },
      { weak_topics: [{ topic: "RNN", missed: 1 }] },
      { weak_topics: [] },
    ]);
    expect(merged).toEqual([
      { topic: "RNN", missed: 3 },
      { topic: "CNN", missed: 1 },
    ]);
  });

  it("handles empty and malformed rows", () => {
    expect(aggregateWeakTopicsAcrossSessions([])).toEqual([]);
    const merged = aggregateWeakTopicsAcrossSessions([
      { weak_topics: [{ topic: "", missed: 1 }, { topic: "X", missed: 0 }] },
    ]);
    expect(merged).toEqual([{ topic: "General", missed: 1 }]);
  });
});
