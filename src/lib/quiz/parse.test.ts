import { describe, expect, it } from "vitest";

import { QuizParseError, parseGeneratedQuiz } from "@/lib/quiz/parse";

const mcq = {
  type: "multiple_choice",
  topic: "Backpropagation",
  question: "What does backpropagation compute?",
  options: ["Gradients", "Weights", "Data", "Loss"],
  correctIndex: 0,
  explanation: "It computes gradients via the chain rule.",
};

const tf = {
  type: "true_false",
  topic: "CNN",
  question: "A convolution is shift-invariant.",
  correctBool: true,
  explanation: "Convolutions are translation equivariant.",
};

const sa = {
  type: "short_answer",
  topic: "RNN",
  question: "Why do RNNs suffer from vanishing gradients?",
  rubric: "Mention repeated multiplication through time.",
  explanation: "Repeated application can shrink gradients.",
};

describe("parseGeneratedQuiz", () => {
  it("parses a valid mixed quiz and assigns ids", () => {
    const draft = parseGeneratedQuiz({ title: "My Quiz", questions: [mcq, tf, sa] });
    expect(draft.title).toBe("My Quiz");
    expect(draft.questions).toHaveLength(3);
    expect(draft.questions.map((q) => q.id)).toEqual(["q1", "q2", "q3"]);
    expect(draft.questions[0].correctIndex).toBe(0);
    expect(draft.questions[1].correctBool).toBe(true);
    expect(draft.questions[2].rubric).toContain("repeated multiplication");
  });

  it("rejects non-objects and empty question lists", () => {
    expect(() => parseGeneratedQuiz(null)).toThrow(QuizParseError);
    expect(() => parseGeneratedQuiz([])).toThrow(QuizParseError);
    expect(() => parseGeneratedQuiz({ questions: [] })).toThrow(QuizParseError);
    expect(() => parseGeneratedQuiz({})).toThrow(QuizParseError);
  });

  it("rejects malformed multiple_choice", () => {
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...mcq, options: ["only"] }] }),
    ).toThrow(QuizParseError);
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...mcq, correctIndex: 9 }] }),
    ).toThrow(QuizParseError);
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...mcq, options: ["a", "a"] }] }),
    ).toThrow(QuizParseError);
  });

  it("rejects malformed true_false and short_answer", () => {
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...tf, correctBool: "yes" }] }),
    ).toThrow(QuizParseError);
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...sa, rubric: "" }] }),
    ).toThrow(QuizParseError);
  });

  it("rejects unknown types and missing prompts", () => {
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...mcq, type: "essay" }] }),
    ).toThrow(QuizParseError);
    expect(() =>
      parseGeneratedQuiz({ questions: [{ ...mcq, question: "" }] }),
    ).toThrow(QuizParseError);
  });

  it("defaults the title when absent", () => {
    const draft = parseGeneratedQuiz({ questions: [mcq] });
    expect(draft.title).toBe("Generated quiz");
  });
});
