import { describe, expect, it } from "vitest";

import { StudyPlanParseError, parseStudyPlan } from "@/lib/study-plan/parse";

const valid = {
  title: "Neural networks week",
  overview: "Rebuild the foundations.",
  days: [
    {
      day: 1,
      title: "Foundations",
      focus: "Chain rule",
      minutes: 30,
      tasks: [
        { title: "Read notes", description: "Read section 2", type: "read", minutes: 20 },
      ],
    },
  ],
  weakTopicActions: ["Redo the backpropagation quiz"],
};

describe("parseStudyPlan", () => {
  it("parses a valid plan", () => {
    const plan = parseStudyPlan(valid);
    expect(plan.days).toHaveLength(1);
    expect(plan.days[0].tasks[0].type).toBe("read");
    expect(plan.weakTopicActions).toHaveLength(1);
  });

  it("rejects plans without days", () => {
    expect(() => parseStudyPlan({ title: "x" })).toThrow(StudyPlanParseError);
  });

  it("defaults unknown task types to practice", () => {
    const plan = parseStudyPlan({
      ...valid,
      days: [
        {
          ...valid.days[0],
          tasks: [
            { title: "Do it", description: "Now", type: "unknown", minutes: 15 },
          ],
        },
      ],
    });
    expect(plan.days[0].tasks[0].type).toBe("practice");
  });
});
