import { google } from "@ai-sdk/google"
import { embed } from "ai"

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = google.textEmbedding("gemini-embedding-001")

  const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  })

  return embedding
}
