import type { DashboardSnapshot } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Loads the dashboard snapshot for a user.
 *
 * Never throws: if the table is missing or the query fails (e.g. before the
 * migration has been applied) we degrade to an empty snapshot so the UI can
 * render its empty/error guidance instead of crashing.
 */
export async function getDashboardSnapshot(
  userId: string,
): Promise<DashboardSnapshot> {
  const empty: DashboardSnapshot = {
    recentDocuments: [],
    totalDocuments: 0,
    readyDocuments: 0,
    inFlightDocuments: 0,
    failedDocuments: 0,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, filename, file_type, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[dashboard] failed to load documents:", error.message);
      return empty;
    }

    const documents = (data ?? []).map((row) => ({
      id: row.id as string,
      filename: row.filename as string,
      file_type: row.file_type as DashboardSnapshot["recentDocuments"][number]["file_type"],
      status: row.status as DashboardSnapshot["recentDocuments"][number]["status"],
      created_at: row.created_at as string,
    }));

    return {
      recentDocuments: documents,
      totalDocuments: documents.length,
      readyDocuments: documents.filter((d) => d.status === "ready").length,
      inFlightDocuments: documents.filter(
        (d) => d.status === "pending" || d.status === "processing",
      ).length,
      failedDocuments: documents.filter((d) => d.status === "error").length,
    };
  } catch (err) {
    console.error("[dashboard] unexpected error loading snapshot:", err);
    return empty;
  }
}
