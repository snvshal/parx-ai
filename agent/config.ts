import { createOpenAI } from "@ai-sdk/openai"
import { createFallback } from "ai-fallback"

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

export const CHAT_MODEL = "openai/gpt-oss-20b" as const

export const chatModel = createFallback({
  models: [groq.chat(CHAT_MODEL), openrouter.chat(CHAT_MODEL)],
  modelResetInterval: 60_000,
  retryAfterOutput: false,
  onError: (error, modelId) => {
    console.error(`Model ${modelId} failed, trying fallback:`, error)
  },
})
