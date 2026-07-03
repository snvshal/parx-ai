import "server-only"

import connectToDatabase from "@/lib/db"
import { Memory } from "@/models/memory.model"
import { Types } from "mongoose"

export async function addMemory(data: {
  chatId: string
  personaId: string
  content: string
}) {
  await connectToDatabase()

  try {
    await Memory.create({
      chatId: new Types.ObjectId(data.chatId),
      personaId: new Types.ObjectId(data.personaId),
      role: "system",
      content: data.content,
    })
  } catch (error) {
    console.error("Error adding memory:", error)
    throw error
  }
}

export async function getMemories(
  chatId: string,
): Promise<{ content: string }[]> {
  await connectToDatabase()

  try {
    const memories = await Memory.find(
      { chatId: new Types.ObjectId(chatId) },
      { content: 1 },
    )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return memories.reverse()
  } catch (error) {
    console.error("Error fetching memories:", error)
    return []
  }
}
