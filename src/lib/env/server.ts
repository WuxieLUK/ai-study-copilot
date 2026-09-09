import "server-only";

import { envClient } from "@/lib/env/client";

/**
 * Server-only environment access.
 *
 * Importing this module from client code fails at build time thanks to the
 * `server-only` marker — secrets can never leak into the browser bundle.
 */
export const envServer = {
  ...envClient,

  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  openaiChatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",

  appUrl: process.env.APP_URL ?? "http://localhost:3000",
} as const;

export const isOpenAIConfigured = Boolean(envServer.openaiApiKey);
