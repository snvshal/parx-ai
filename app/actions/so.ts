import "server-only"

import { buildSystemInstruction } from "@/lib/utils"
import { Instruction } from "@/models/instruction.model"
import connectToDatabase from "@/lib/db"
import { getServerSession } from "next-auth"
import { TUser } from "@/schemas/user.schema"
import { User } from "@/models/user.model"

export const getInstructionsByUserId = async (userId: string) => {
  try {
    await connectToDatabase()
    const instructions = await Instruction.find({ userId })
    const systemInstructionContent = buildSystemInstruction(instructions)

    return systemInstructionContent
  } catch (error) {
    console.error("Error fetching session user:", error)
    return ""
  }
}
