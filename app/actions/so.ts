import "server-only"

import { buildSystemInstruction } from "@/lib/utils"
import { Instruction } from "@/models/instruction.model"
import connectToDatabase from "@/lib/db"
import { generateEmbedding } from "@/lib/vector"
import { redis } from "@/lib/redis"
import { Types } from "mongoose"
import { TInstruction } from "@/schemas/instruction.schema"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const CACHE_TTL = {
  CORE_INSTRUCTIONS: 3600,
}

const getCacheKey = {
  coreInstructions: (userId: string) => `instructions:core:${userId}`,
}

export const getInstructionsByUserId = async (
  userId: string,
  query?: string,
) => {
  await connectToDatabase()
  const userObjectId = new Types.ObjectId(userId)

  try {
    let coreInstructions: TInstruction[] = []

    const cacheKey = getCacheKey.coreInstructions(userId)
    const cachedCore = await redis.get(cacheKey)

    if (cachedCore) {
      coreInstructions = cachedCore as TInstruction[]
    } else {
      coreInstructions = (await Instruction.find({
        userId: userObjectId,
        type: { $in: ["Identity", "Core", "Global"] },
      }).lean()) as unknown as TInstruction[]

      if (coreInstructions.length > 0) {
        await redis.setex(
          cacheKey,
          CACHE_TTL.CORE_INSTRUCTIONS,
          coreInstructions,
        )
      }
    }

    let finalInstructions = [...coreInstructions]

    if (query?.trim()) {
      const embedding = await generateEmbedding(query)
      const vectorResults = await Instruction.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: embedding,
            numCandidates: 50,
            limit: 5,
            filter: {
              userId: userObjectId,
              type: { $nin: ["Identity", "Core", "Global"] },
            },
          },
        },
        {
          $addFields: {
            score: { $meta: "vectorSearchScore" },
          },
        },
        {
          $match: {
            score: { $gte: 0.7 },
          },
        },
      ])
      finalInstructions = [...coreInstructions, ...vectorResults]
    }

    if (finalInstructions.length === 0) {
      finalInstructions = (await Instruction.find({ userId: userObjectId })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()) as unknown as TInstruction[]
    }

    return buildSystemInstruction(finalInstructions)
  } catch (error) {
    console.error("Error fetching instructions:", error)
    try {
      const instructions = (await Instruction.find({
        userId: userObjectId,
      })
        .limit(10)
        .lean()) as unknown as TInstruction[]
      return buildSystemInstruction(instructions)
    } catch (innerError) {
      console.error("Critical error fetching instructions:", innerError)
      return ""
    }
  }
}

export async function classifyIntent(query: string): Promise<boolean> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system:
        "You are a classifier. Determine if the question asks about 'you', 'your', 'my', or anything related to the persona's identity, personality, content, or requires custom context. If uncertain, say YES. Only say NO if you're completely certain it's a general question.",
      prompt: `Query: "${query}"

Does this question ask about:
- "You" or "Your" (referring to the persona)?
- "My" or personal data related to the persona?
- Identity, personality, background, or content?
- Anything that might need the persona's custom instructions?

IMPORTANT:
- If uncertain or confused, answer YES
- Only answer NO if you're 100% certain it's general knowledge

Examples needing context (YES):
- "What's your personality?", "Tell me about yourself"
- "Show me your content", "What do you like?"
- "What's my style?", "What do you know about me?"

Examples NOT needing context (NO):
- "Hi", "What's 2+2?", "Tell me a joke"
- "What's the weather?", "Explain photosynthesis"

Answer only: YES or NO`,
      maxOutputTokens: 5,
    })

    return text.trim().toUpperCase().startsWith("YES")
  } catch (error) {
    console.error("Intent classification error:", error)
    return true
  }
}
