/** Shared quiz domain types (mirrored in the JSON contracts). */

export const QUESTION_TYPES = [
  "multiple_choice",
  "true_false",
  "short_answer",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

/** A question as generated (no correct-answer leaks until review). */
export type QuizQuestion = {
  id: string;
  type: QuestionType;
  topic: string;
  question: string;
  /** multiple_choice: 2-4 choices */
  options?: string[];
  /** multiple_choice: index of the correct option */
  correctIndex?: number;
  /** true_false: expected value */
  correctBool?: boolean;
  /** short_answer: reference points the grader checks against */
  rubric?: string;
  explanation: string;
};

export type QuizGenerationRequest = {
  documentIds?: string[];
  questionCount?: number;
};

export type QuizDraft = {
  title: string;
  questions: QuizQuestion[];
};

/** Student's submitted answer for one question. */
export type QuizAnswerInput = {
  questionId: string;
  selectedIndex?: number | null;
  selectedBool?: boolean | null;
  text?: string | null;
};

/** Per-question grading result returned to the UI. */
export type GradedQuestion = QuizQuestion & {
  correct: boolean;
  /** 0..1 partial credit (short answers) */
  score: number;
  /** auto-answer or AI feedback for short answers */
  feedback?: string;
  correctAnswerText?: string;
};

export type QuizResult = {
  title: string;
  questionCount: number;
  correctCount: number;
  scorePct: number;
  questions: GradedQuestion[];
  weakTopics: { topic: string; missed: number }[];
};
