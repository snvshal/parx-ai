"use server"

import connectToDatabase from "@/lib/db"
import { Chat } from "@/models/chat.model"
import { Instruction } from "@/models/instruction.model"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"

export type TPersona = {
  id: string
  username: string
  name: string
  avatar: string
  firstMessage: string
  chatCount: number
  instructionStatus: "null" | "low" | "medium" | "high" | "great"
}

export type TPersonaResponse = {
  success: boolean
  data: TPersona[]
}

type TStatusParams = {
  // Instruction count thresholds
  lowCount?: number
  mediumCount?: number
  highCount?: number
  greatCount?: number
  // Token thresholds (approx content richness)
  lowTokens?: number
  mediumTokens?: number
  highTokens?: number
  greatTokens?: number
}

/**
 * Estimate tokens roughly as words * 1.3 (approx GPT tokenization ratio)
 */
function estimateTokens(text: string): number {
  if (!text) return 0
  const words = text.trim().split(/\s+/).length
  return Math.round(words * 1.3)
}

/**
 * Fetch all people and calculate instruction richness status
 */
export const getPeople = async (
  params: TStatusParams = {
    lowCount: 1,
    mediumCount: 3,
    highCount: 5,
    greatCount: 10,
    lowTokens: 200,
    mediumTokens: 600,
    highTokens: 1000,
    greatTokens: 2000,
  },
): Promise<TPersonaResponse> => {
  try {
    await connectToDatabase()

    const users: TUser[] = await User.find(
      {},
      {
        _id: 1,
        username: 1,
        name: 1,
        avatar: 1,
        firstMessage: 1,
      },
    )

    const personas: TPersona[] = await Promise.all(
      users.map(async (user) => {
        const [chatCount, instructions] = await Promise.all([
          Chat.countDocuments({ personaId: user._id }),
          Instruction.find({ userId: user._id }),
        ])

        const instructionCount = instructions.length
        const totalTokens = instructions.reduce(
          (sum, ins) => sum + estimateTokens(ins.content),
          0,
        )

        let instructionStatus: TPersona["instructionStatus"] = "null"

        if (
          instructionCount >= (params.greatCount ?? 10) ||
          totalTokens >= (params.greatTokens ?? 2000)
        )
          instructionStatus = "great"
        else if (
          instructionCount >= (params.highCount ?? 5) ||
          totalTokens >= (params.highTokens ?? 1000)
        )
          instructionStatus = "high"
        else if (
          instructionCount >= (params.mediumCount ?? 3) ||
          totalTokens >= (params.mediumTokens ?? 600)
        )
          instructionStatus = "medium"
        else if (
          instructionCount >= (params.lowCount ?? 1) ||
          totalTokens >= (params.lowTokens ?? 200)
        )
          instructionStatus = "low"

        return {
          id: String(user._id),
          username: user.username,
          name: user.name,
          avatar: user.avatar as string,
          firstMessage: user.firstMessage,
          chatCount,
          instructionStatus,
        }
      }),
    )

    return { success: true, data: personas }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, data: [] }
  }
}
