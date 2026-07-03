import "server-only"

import { Instruction } from "@/models/instruction.model"
import connectToDatabase from "@/lib/db"
import { Types } from "mongoose"
import type { TInstruction } from "@/schemas/instruction.schema"
import type { InstructionListItem } from "../types"

export async function getInstructionList(
  personaId: string,
): Promise<InstructionListItem[]> {
  await connectToDatabase()
  const userObjectId = new Types.ObjectId(personaId)

  try {
    const instructions = await Instruction.find(
      { userId: userObjectId },
      { type: 1, content: 1 },
    ).lean()

    return instructions.map((inst) => ({
      _id: String(inst._id),
      type: inst.type,
      content: inst.content.slice(0, 100),
    }))
  } catch (error) {
    console.error("Error fetching instruction list:", error)
    return []
  }
}

export async function getInstructionById(
  instructionId: string,
): Promise<TInstruction | null> {
  await connectToDatabase()

  try {
    const instruction = (await Instruction.findById(
      instructionId,
    ).lean()) as TInstruction | null

    return instruction
  } catch (error) {
    console.error("Error fetching instruction by ID:", error)
    return null
  }
}
