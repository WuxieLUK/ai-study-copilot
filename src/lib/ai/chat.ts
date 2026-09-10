import "server-only";

import OpenAI from "openai";

import { envServer, isChatConfigured } from "@/lib/env/server";

export class ChatNotConfiguredError extends Error {
  constructor(
    message = "No chat model is configured. Set AI_CHAT_API_KEY (e.g. a DeepSeek key) plus AI_CHAT_BASE_URL/AI_CHAT_MODEL to enable AI answers.",
  ) {
    super(message);
    this.name = "ChatNotConfiguredError";
  }
}

export const chatModel = envServer.chatModel;

/**
 * OpenAI-compatible chat client. Works with DeepSeek, OpenAI, Groq, a local
 * server, … — provider is chosen purely by `AI_CHAT_BASE_URL` + key.
 */
export function createChatClient(): OpenAI {
  if (!isChatConfigured) {
    throw new ChatNotConfiguredError();
  }
  return new OpenAI({
    apiKey: envServer.chatApiKey,
    baseURL: envServer.chatBaseUrl,
  });
}
