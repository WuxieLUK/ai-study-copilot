/** Pure analytics over quiz sessions — unit-testable, no I/O. */

export type SessionResponseRecord = {
  topic: string;
  correct: boolean;
};

export type QuizSessionLike = {
  id: string;
  title: string;
  score_pct: number;
  created_at: string;
  responses: SessionResponseRecord[];
};

export type TopicStat = {
  topic: string;
  attempts: number;
  correctCount: number;
  /** 0..1 */
  accuracy: number;
};

export type WeakTopicEntry = { topic: string; missed: number };

export const STRONG_ACCURACY = 0.8;
export const WEAK_ACCURACY = 0.7;

/** Aggregates per-topic performance across all sessions' responses. */
export function computeTopicStats(
  sessions: QuizSessionLike[],
): TopicStat[] {
  const totals = new Map<string, { attempts: number; correct: number }>();
  for (const session of sessions) {
    for (const response of session.responses) {
      const topic = response.topic.trim() || "General";
      const current = totals.get(topic) ?? { attempts: 0, correct: 0 };
      current.attempts += 1;
      if (response.correct) current.correct += 1;
      totals.set(topic, current);
    }
  }
  return [...totals.entries()]
    .map(([topic, { attempts, correct }]) => ({
      topic,
      attempts,
      correctCount: correct,
      accuracy: attempts > 0 ? correct / attempts : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

export type StudyInsights = {
  sessionCount: number;
  averageScore: number;
  bestScore: number;
  lastScore: number | null;
  recentScores: { id: string; title: string; scorePct: number }[];
  topicStats: TopicStat[];
  strongTopics: TopicStat[];
  weakTopics: TopicStat[];
};

export function computeInsights(sessions: QuizSessionLike[]): StudyInsights {
  const scores = sessions.map((s) => s.score_pct);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const topicStats = computeTopicStats(sessions);
  const strongTopics = topicStats
    .filter((t) => t.accuracy >= STRONG_ACCURACY)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts);
  const weakTopics = topicStats
    .filter((t) => t.accuracy < WEAK_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);

  return {
    sessionCount: sessions.length,
    averageScore,
    bestScore,
    lastScore: scores.length > 0 ? scores[scores.length - 1] : null,
    recentScores: sessions
      .slice(-8)
      .map((s) => ({ id: s.id, title: s.title, scorePct: s.score_pct })),
    topicStats,
    strongTopics,
    weakTopics,
  };
}

/**
 * Builds the "review these" queue from the denormalized weak_topics column
 * of the sessions table: { topic, missed } aggregated across sessions.
 */
export function aggregateWeakTopicsAcrossSessions(
  rows: { weak_topics: WeakTopicEntry[] }[],
): WeakTopicEntry[] {
  const missed = new Map<string, number>();
  for (const row of rows) {
    for (const entry of row.weak_topics ?? []) {
      const topic = (entry?.topic ?? "").trim() || "General";
      const n = Number(entry?.missed) || 0;
      if (n <= 0) continue;
      missed.set(topic, (missed.get(topic) ?? 0) + n);
    }
  }
  return [...missed.entries()]
    .map(([topic, missedCount]) => ({ topic, missed: missedCount }))
    .sort((a, b) => b.missed - a.missed);
}
