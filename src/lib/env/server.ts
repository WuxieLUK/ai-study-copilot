import "server-only";

import { envClient } from "@/lib/env/client";

/**
 * Server-only environment access.
 *
 * Importing this module from client code fails at build time thanks to the
 * `server-only` marker — secrets can never leak into the browser bundle.
 *
 * Provider model
 *  - Chat (answer / quiz / grading) speaks the OpenAI-compatible protocol, so
 *    any compatible provider works — DeepSeek, OpenAI, Groq, local servers…
 *    Configure with AI_CHAT_* (falls back to DEEPSEEK_/OPENAI_ keys).
 *  - Embeddings run locally by default (transformers.js) so no second API
 *    account is needed; set AI_EMBEDDING_API_KEY + AI_EMBEDDING_BASE_URL to
 *    use a hosted OpenAI-compatible embeddings API instead.
 */

function firstValue(...values: (string | undefined)[]): string {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return "";
}

function numberValue(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

const embeddingBaseUrl = process.env.AI_EMBEDDING_BASE_URL?.trim() ?? "";
const embeddingApiKey = firstValue(
  process.env.AI_EMBEDDING_API_KEY,
  process.env.OPENAI_API_KEY,
);

export const envServer = {
  ...envClient,

  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
  databaseUrl: process.env.DATABASE_URL?.trim() ?? "",

  // --- Chat / LLM (OpenAI-compatible) --------------------------------
  chatApiKey: firstValue(
    process.env.AI_CHAT_API_KEY,
    process.env.DEEPSEEK_API_KEY,
    process.env.OPENAI_API_KEY,
  ),
  chatBaseUrl:
    process.env.AI_CHAT_BASE_URL?.trim() || "https://api.openai.com/v1",
  chatModel: process.env.AI_CHAT_MODEL?.trim() || "gpt-4o-mini",

  // --- Embeddings ----------------------------------------------------
  /** Empty → run the local model instead of a hosted embeddings API. */
  embeddingApiKey,
  embeddingBaseUrl,
  embeddingModel:
    process.env.AI_EMBEDDING_MODEL?.trim() ||
    "Xenova/multilingual-e5-small",
  embeddingDim: numberValue(process.env.AI_EMBEDDING_DIM, 384),
  /** e5 models expect "query: " / "passage: " prefixes. */
  embeddingUseE5Prefixes:
    (process.env.AI_EMBEDDING_PREFIXES?.trim() || "e5") === "e5",
  /** Model download mirror (huggingface.co is unreachable in some regions). */
  hfEndpoint: process.env.HF_ENDPOINT?.trim() || "https://hf-mirror.com",

  appUrl: process.env.APP_URL?.trim() || "http://localhost:3000",
} as const;

/** Chat provider has credentials. */
export const isChatConfigured = Boolean(envServer.chatApiKey);

/** Embeddings run through a hosted OpenAI-compatible API (otherwise local). */
export const isHostedEmbeddingConfigured = Boolean(
  envServer.embeddingApiKey && envServer.embeddingBaseUrl,
);

export const embeddingProvider: "hosted" | "local" =
  isHostedEmbeddingConfigured ? "hosted" : "local";

/** Local embeddings always work (a model download is attempted on demand). */
export const isEmbeddingConfigured = true;
