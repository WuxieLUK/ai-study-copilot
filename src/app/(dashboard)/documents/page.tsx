import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DocumentList } from "@/components/documents/document-list";
import { UploadZone } from "@/components/documents/upload-zone";
import { getCurrentUser } from "@/lib/auth/session";
import { getDocuments } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/env/client";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  // Without Supabase the (dashboard) layout shows its setup notice.
  if (!isSupabaseConfigured) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const documents = await getDocuments(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Documents
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload course materials — they become the source of your summaries,
          quizzes and tutor answers.
        </p>
      </div>

      <UploadZone />

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            All documents
          </h2>
          <p className="text-xs text-muted-foreground">
            {documents.length === 0
              ? "Nothing here yet."
              : `${documents.length} file${documents.length === 1 ? "" : "s"} stored under your account.`}
          </p>
        </div>
        <DocumentList documents={documents} />
      </section>
    </div>
  );
}
