import { google } from "@ai-sdk/google"
import { embed } from "ai"

export async function generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: google.textEmbedding("text-embedding-004"),
        value: text,
    })
    return embedding
}
