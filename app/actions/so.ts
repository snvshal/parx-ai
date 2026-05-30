import "server-only"

import { Instruction } from "@/models/instruction.model"
import connectToDatabase from "@/lib/db"
import { Types } from "mongoose"
import { TInstruction } from "@/schemas/instruction.schema"
import { generateText } from "ai"
import { openrouter } from "@/lib/ai"
import { CHAT_MODEL } from "@/lib/constants/models"

const CORE_TYPES = ["Identity", "Core", "Global"]

export async function selectRelevantInstructions(
  userId: string,
  query: string,
): Promise<TInstruction[]> {
  await connectToDatabase()
  const userObjectId = new Types.ObjectId(userId)

  try {
    const allTypes = await Instruction.find(
      { userId: userObjectId },
      { _id: 1, type: 1 },
    ).lean()

    if (!allTypes.length) return []

    const coreTypes = allTypes.filter((t) => CORE_TYPES.includes(t.type))

    if (!query?.trim()) {
      const coreIds = coreTypes.map((t) => t._id)
      return (await Instruction.find({ _id: { $in: coreIds } }).lean()) as unknown as TInstruction[]
    }

    const nonCoreTypes = allTypes.filter((t) => !CORE_TYPES.includes(t.type))

    if (nonCoreTypes.length === 0) {
      const coreIds = coreTypes.map((t) => t._id)
      return (await Instruction.find({ _id: { $in: coreIds } }).lean()) as unknown as TInstruction[]
    }

    const typeNames = nonCoreTypes.map((t) => t.type)

    const { text } = await generateText({
      model: openrouter.chat(CHAT_MODEL),
      system:
        "You are a relevance selector. Given a user query and instruction types, select which types contain info relevant to answering. Return ONLY a JSON array of type strings. If none are relevant, return [].",
      prompt: `User query: "${query}"

Instruction types:
${typeNames.map((t, i) => `${i + 1}. "${t}"`).join("\n")}

Which types are relevant? Return ONLY a JSON array.`,
      maxOutputTokens: 200,
    })

    const availableTypeNames = new Set(typeNames)

    let selectedTypes: string[]
    try {
      const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
      selectedTypes = JSON.parse(cleaned)
      if (!Array.isArray(selectedTypes)) selectedTypes = []
      selectedTypes = selectedTypes.filter((t) => availableTypeNames.has(t))
    } catch {
      selectedTypes = []
    }

    const allSelectedTypes = [...new Set([...CORE_TYPES, ...selectedTypes])]

    const instructions = (await Instruction.find({
      userId: userObjectId,
      type: { $in: allSelectedTypes },
    }).lean()) as unknown as TInstruction[]

    return instructions.slice(0, 15)
  } catch (error) {
    console.error("Error selecting relevant instructions:", error)
    return (await Instruction.find({
      userId: userObjectId,
    }).lean()) as unknown as TInstruction[]
  }
}
