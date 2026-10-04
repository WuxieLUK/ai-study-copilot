/** Study plan domain types and the strict JSON contract returned by the LLM. */

export const PLAN_TASK_TYPES = [
  "read",
  "recall",
  "practice",
  "teach",
  "review",
] as const;

export type PlanTaskType = (typeof PLAN_TASK_TYPES)[number];

export type StudyPlanTask = {
  title: string;
  description: string;
  type: PlanTaskType;
  minutes: number;
};

export type StudyPlanDay = {
  day: number;
  title: string;
  focus: string;
  minutes: number;
  tasks: StudyPlanTask[];
};

export type StudyPlan = {
  id: string;
  title: string;
  overview: string;
  days: StudyPlanDay[];
  weakTopicActions: string[];
  createdAt: string;
};

export type StudyPlanRequest = {
  documentIds?: string[];
  days?: number;
  goal?: string;
};
