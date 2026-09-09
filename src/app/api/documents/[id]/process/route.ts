import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env/client";
import { processDocument } from "@/lib/rag/process";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/documents/[id]/process
 * Runs the RAG pipeline for one of the caller's documents (download →
 * extract → chunk → embed → store chunks → status ready/error).
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { status: "error", message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { status: "error", message: "Authentication required." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const outcome = await processDocument(user.id, id);

  return NextResponse.json(outcome, {
    status: outcome.status === "ready" ? 200 : 422,
  });
}
