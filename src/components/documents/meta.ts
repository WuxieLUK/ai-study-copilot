import { File, FileCode2, FileText, type LucideIcon } from "lucide-react";

import type { DocumentFileType, DocumentStatus } from "@/lib/db/types";

/** Visual metadata shared by document surfaces (list, dashboard). */
export const STATUS_META: Record<
  DocumentStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Queued",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300",
  },
  processing: {
    label: "Processing",
    badge:
      "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-300",
  },
  ready: {
    label: "Ready",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  error: {
    label: "Failed",
    badge:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300",
  },
};

export const FILE_TYPE_ICONS: Record<DocumentFileType, LucideIcon> = {
  pdf: FileText,
  md: File,
  txt: FileCode2,
};
