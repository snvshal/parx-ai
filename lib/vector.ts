import { openrouter } from "@/lib/ai"
import { embed } from "ai"
import { EMBEDDING_MODEL } from "@/lib/constants/models"

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openrouter.embedding(EMBEDDING_MODEL),
    value: text,
  })

  return embedding
}
