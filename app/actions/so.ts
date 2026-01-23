import "server-only"

import { buildSystemInstruction } from "@/lib/utils"
import { Instruction } from "@/models/instruction.model"
import connectToDatabase from "@/lib/db"
import { generateEmbedding } from "@/lib/vector"
import { Types } from "mongoose"

export const getInstructionsByUserId = async (
  userId: string,
  query?: string,
) => {
  try {
    await connectToDatabase()

    const userObjectId = new Types.ObjectId(userId)

    // 1. Fetch "Core" instructions that should always be present
    const coreInstructions = await Instruction.find({
      userId: userObjectId,
      type: { $in: ["Identity", "Core", "Global"] },
    }).lean()

    let contextualInstructions: any[] = []

    // 2. Fetch "Contextual" instructions via Vector Search
    if (query?.trim()) {
      const embedding = await generateEmbedding(query)
      const vectorResults = await Instruction.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: embedding,
            numCandidates: 50, // Reduced for speed
            limit: 5, // Reduced Top-K for token efficiency
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
            score: { $gte: 0.7 }, // Similarity threshold: only include relevant matches
          },
        },
      ])
      contextualInstructions = vectorResults
    }

    // 3. Fallback: if no query or no contextual matches found, AND we have no core instructions
    // (We only fallback if the total set is empty to ensure we don't bloat the prompt)
    let finalInstructions = [...coreInstructions, ...contextualInstructions]

    if (finalInstructions.length === 0) {
      // If we still have nothing, just get the most recent 10 as a fallback
      finalInstructions = await Instruction.find({ userId: userObjectId })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()
    }

    const systemInstructionContent = buildSystemInstruction(finalInstructions)

    return systemInstructionContent
  } catch (error) {
    console.error("Error fetching instructions with optimized search:", error)
    // Fallback to normal fetch on error
    try {
      const instructions = await Instruction.find({ userId })
        .limit(10)
        .lean()
      return buildSystemInstruction(instructions as any)
    } catch (innerError) {
      console.error("Critical error fetching instructions:", innerError)
      return ""
    }
  }
}
