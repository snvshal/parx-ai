"use server"

import connectToDatabase from "@/lib/db"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"
import { getServerSession } from "next-auth"
import { buildSystemInstruction, formatZodError, ps } from "@/lib/utils"
import { Instruction } from "@/models/instruction.model"
import {
  InstructionZodSchema,
  TInstruction,
} from "@/schemas/instruction.schema"
import { Chat } from "@/models/chat.model"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { getSessionUser } from "@/app/actions/session-user"
import { TNewInstruction } from "@/components/settings/instruction"
import { revalidatePath } from "next/cache"
import { Message } from "@/models/message.model"

export const getInstructions = async (): Promise<TInstruction[]> => {
  "use cache: private"
  try {
    await connectToDatabase()

    const user: TUser | null = await getSessionUser()
    if (!user) throw new Error("User not found")

    const instructions = await Instruction.find({ userId: user._id })
      .sort({
        updatedAt: -1,
      })
      .lean()

    return ps(instructions) || []
  } catch (error) {
    console.error("Error fetching instructions:", error)
    throw new Error("Failed to fetch instructions")
  }
}

export const addInstruction = async (
  newInstruction: TNewInstruction,
): Promise<TInstruction | { error: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const sessionUser: TUser | null = await getSessionUser()
    if (!sessionUser) throw new Error("User not found")

    const validInstruction = {
      userId: sessionUser._id?.toString(),
      ...newInstruction,
    }

    const validationResult = InstructionZodSchema.safeParse(validInstruction)
    if (!validationResult.success) {
      return { error: formatZodError(validationResult.error) }
    }

    const addedInstruction = await Instruction.create(validInstruction)

    revalidatePath("/settings/instructions")

    setNotification(addedInstruction)

    return ps(addedInstruction)
  } catch (error) {
    console.error("Error adding instruction:", error)
    return {
      error:
        error instanceof Error ? error.message : "Failed to add instruction",
    }
  }
}

export const setNotification = async (
  instruction: TInstruction,
): Promise<void> => {
  try {
    const sessionUser: TUser | null = await getSessionUser()
    if (!sessionUser) throw new Error("User not found!")

    const userChats = await Chat.find({ personaId: sessionUser._id })
    if (!userChats.length) return

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Generate a clear, concise user-facing message like a chat app message using this instruction: 
        ${buildSystemInstruction([instruction])}`,
    })

    const ntUsers = userChats
      .filter((c) => String(c.userId) !== String(sessionUser._id))
      .map((chat) => ({
        chatId: chat._id,
        userId: chat.userId,
        personaId: chat.personaId,
        type: "text",
        role: "assistant",
        content: text,
      }))

    await Message.insertMany(ntUsers)

    await Chat.updateMany(
      { personaId: sessionUser._id, userId: { $ne: sessionUser._id } },
      { $inc: { unreadCount: 1 } },
    )
  } catch (err) {
    console.error("setNotification error:", err)
  }
}

export const updateInstruction = async (
  id: string,
  type?: string,
  content?: string,
  links?: { url: string; alt: string }[],
  mediaUrls?: { url: string; alt: string }[],
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    const instruction = await Instruction.findOne({
      _id: id,
      userId: user._id,
    })

    if (!instruction) throw new Error("Instruction not found")

    const candidate = {
      userId: user._id?.toString(),
      type: type ?? instruction.type,
      content: content ?? instruction.content,
      mediaUrls: mediaUrls ?? instruction.mediaUrls ?? [],
      links: links ?? instruction.links ?? [],
    }

    const validationResult = InstructionZodSchema.safeParse(candidate)
    if (!validationResult.success) {
      return { success: false, message: formatZodError(validationResult.error) }
    }

    if (type) instruction.type = type
    if (content) instruction.content = content
    if (links) instruction.links = links
    if (mediaUrls) instruction.mediaUrls = mediaUrls

    await instruction.save()

    revalidatePath("/settings/instructions")

    return {
      success: true,
      message: "Instruction updated successfully!",
    }
  } catch (error) {
    console.error("Error updating instruction:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update instruction",
    }
  }
}

export const deleteInstruction = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    await Instruction.deleteOne({
      _id: id,
      userId: user._id,
    })

    revalidatePath("/settings/instructions")

    return {
      success: true,
      message: "Instruction deleted successfully!",
    }
  } catch (error) {
    console.error("Error deleting instruction:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete instruction",
    }
  }
}
