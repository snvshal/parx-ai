import { openrouter } from "@/lib/ai"
import { embed } from "ai"

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openrouter.embedding("openai/text-embedding-3-small"),
    value: text,
  })

  return embedding
}
