import type { Metadata } from "next";

import { TutorChat } from "@/components/tutor/tutor-chat";

export const metadata: Metadata = { title: "AI Tutor" };

export default function TutorPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          AI Tutor
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ask questions about your uploaded materials — every answer cites its
          source passages.
        </p>
      </div>
      <TutorChat />
    </div>
  );
}
