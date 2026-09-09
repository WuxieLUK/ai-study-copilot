export type WeakTopic = { topic: string; missed: number };

export type TopicScoreInput = {
  topic: string;
  correct: boolean;
};

/**
 * Aggregates wrong answers into weak topics (sorted by most missed).
 * Fully-correct topics are omitted. Pure and unit-tested.
 */
export function aggregateWeakTopics(
  results: TopicScoreInput[],
): WeakTopic[] {
  const missedByTopic = new Map<string, number>();
  for (const result of results) {
    if (result.correct) continue;
    const topic = result.topic.trim() || "General";
    missedByTopic.set(topic, (missedByTopic.get(topic) ?? 0) + 1);
  }
  return [...missedByTopic.entries()]
    .map(([topic, missed]) => ({ topic, missed }))
    .sort((a, b) => b.missed - a.missed);
}
