import {
  PLAN_TASK_TYPES,
  type PlanTaskType,
  type StudyPlan,
  type StudyPlanDay,
  type StudyPlanTask,
} from "@/lib/study-plan/types";

export class StudyPlanParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudyPlanParseError";
  }
}

const TASK_TYPE_SET = new Set<string>(PLAN_TASK_TYPES);

function text(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new StudyPlanParseError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function minutes(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new StudyPlanParseError(`${label} must be a non-negative number.`);
  }
  return Math.min(480, Math.round(value));
}

function parseTask(raw: unknown, index: number): StudyPlanTask {
  if (!raw || typeof raw !== "object") {
    throw new StudyPlanParseError(`Task ${index + 1} is invalid.`);
  }
  const item = raw as Record<string, unknown>;
  const type =
    typeof item.type === "string" && TASK_TYPE_SET.has(item.type)
      ? (item.type as PlanTaskType)
      : "practice";

  return {
    title: text(item.title, `Task ${index + 1} title`).slice(0, 120),
    description: text(
      item.description ?? "Complete the task.",
      `Task ${index + 1} description`,
    ).slice(0, 500),
    type,
    minutes: minutes(item.minutes, `Task ${index + 1} minutes`),
  };
}

function parseDay(raw: unknown, index: number): StudyPlanDay {
  if (!raw || typeof raw !== "object") {
    throw new StudyPlanParseError(`Day ${index + 1} is invalid.`);
  }
  const item = raw as Record<string, unknown>;
  if (!Array.isArray(item.tasks) || item.tasks.length === 0) {
    throw new StudyPlanParseError(`Day ${index + 1} needs at least one task.`);
  }

  const tasks = item.tasks.slice(0, 6).map(parseTask);
  return {
    day: Number.isInteger(item.day) ? (item.day as number) : index + 1,
    title: text(item.title, `Day ${index + 1} title`).slice(0, 120),
    focus: text(item.focus, `Day ${index + 1} focus`).slice(0, 240),
    minutes: Math.min(
      720,
      Math.max(
        tasks.reduce((sum, task) => sum + task.minutes, 0),
        minutes(item.minutes ?? 0, `Day ${index + 1} minutes`),
      ),
    ),
    tasks,
  };
}

/** Validates and normalizes an LLM study-plan response. */
export function parseStudyPlan(raw: unknown): Omit<StudyPlan, "id" | "createdAt"> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new StudyPlanParseError("Plan response is not an object.");
  }
  const root = raw as Record<string, unknown>;
  if (!Array.isArray(root.days) || root.days.length === 0) {
    throw new StudyPlanParseError("Plan contains no days.");
  }

  const days = root.days.slice(0, 14).map(parseDay);
  const weakTopicActions = Array.isArray(root.weakTopicActions)
    ? root.weakTopicActions
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  return {
    title: text(root.title, "title").slice(0, 160),
    overview: text(root.overview, "overview").slice(0, 700),
    days,
    weakTopicActions,
  };
}
