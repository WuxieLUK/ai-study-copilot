import "server-only";

import OpenAI from "openai";

import { envServer, isOpenAIConfigured } from "@/lib/env/server";

export class EmbeddingNotConfiguredError extends Error {
  constructor() {
    super(
      "OPENAI_API_KEY is not configured. Add it to your environment to enable document processing.",
    );
    this.name = "EmbeddingNotConfiguredError";
  }
}

/**
 * Embeds a batch of texts with the configured OpenAI embeddings model.
 * Server-only (imports `server-only`).
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!isOpenAIConfigured) {
    throw new EmbeddingNotConfiguredError();
  }
  if (texts.length === 0) return [];

  const client = new OpenAI({ apiKey: envServer.openaiApiKey });
  const response = await client.embeddings.create({
    model: envServer.openaiEmbeddingModel,
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
