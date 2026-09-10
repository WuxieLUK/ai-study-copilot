import "server-only";

import OpenAI from "openai";

import { applyEmbeddingPrefixes } from "@/lib/ai/prefix";
import {
  embeddingProvider,
  envServer,
  isHostedEmbeddingConfigured,
} from "@/lib/env/server";

/**
 * Embeddings. Two modes:
 *  - hosted: any OpenAI-compatible embeddings API (AI_EMBEDDING_API_KEY +
 *    AI_EMBEDDING_BASE_URL)
 *  - local (default): a small multilingual model run in-process via
 *    transformers.js, downloaded from HF_ENDPOINT (hf-mirror.com by default)
 *    so no second API account is required.
 */

export class EmbeddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmbeddingError";
  }
}

export const EMBEDDING_DIM = envServer.embeddingDim;
export const embeddingMode = embeddingProvider;

type LocalExtractor = (
  texts: string[],
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ tolist(): number[][] }>;

let localExtractorPromise: Promise<LocalExtractor> | null = null;

function loadLocalExtractor(): Promise<LocalExtractor> {
  if (!localExtractorPromise) {
    localExtractorPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // huggingface.co is unreachable in some regions — use the mirror.
      env.remoteHost = envServer.hfEndpoint;
      const extractor = await pipeline(
        "feature-extraction",
        envServer.embeddingModel,
        { dtype: "q8" },
      );
      return extractor as unknown as LocalExtractor;
    })().catch((err: unknown) => {
      localExtractorPromise = null; // allow a retry on the next request
      const reason = err instanceof Error ? err.message : String(err);
      throw new EmbeddingError(
        `Could not load the local embedding model "${envServer.embeddingModel}" from ${envServer.hfEndpoint} (${reason}). Check your network, set HF_ENDPOINT to a reachable mirror, or configure a hosted embeddings API.`,
      );
    });
  }
  return localExtractorPromise;
}

async function embedWithHostedApi(texts: string[]): Promise<number[][]> {
  const client = new OpenAI({
    apiKey: envServer.embeddingApiKey,
    baseURL: envServer.embeddingBaseUrl,
  });
  const response = await client.embeddings.create({
    model: envServer.embeddingModel,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

async function embedWithLocalModel(texts: string[]): Promise<number[][]> {
  const extractor = await loadLocalExtractor();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  return isHostedEmbeddingConfigured
    ? embedWithHostedApi(texts)
    : embedWithLocalModel(texts);
}

/** Embeds document chunks for storage (adds "passage: " when using e5). */
export async function embedPassages(texts: string[]): Promise<number[][]> {
  return embedBatch(
    applyEmbeddingPrefixes(texts, "passage", envServer.embeddingUseE5Prefixes),
  );
}

/** Embeds a single search query (adds "query: " when using e5). */
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedBatch(
    applyEmbeddingPrefixes([text], "query", envServer.embeddingUseE5Prefixes),
  );
  if (!vector) {
    throw new EmbeddingError("The embedding provider returned no vector.");
  }
  return vector;
}
