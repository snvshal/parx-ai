"use server"

import connectToDatabase from "@/lib/db"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { formatZodError } from "@/lib/utils"
import { Instruction } from "@/models/instruction.model"
import { InstructionSchema, TInstruction } from "@/schemas/instruction.schema"
import { sendNotificationToMany } from "@/app/actions/notification"
import { Chat } from "@/models/chat.model"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { getSessionUser } from "@/app/actions/session-user"
import { TNewInstruction } from "@/components/settings/instruction"

export const getInstructions = async (): Promise<TInstruction[]> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    const instructions = await Instruction.find({ userId: user._id }).sort({
      updatedAt: -1,
    })

    return instructions || []
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

    const validationResult = InstructionSchema.safeParse(validInstruction)
    if (!validationResult.success) {
      return { error: formatZodError(validationResult.error) }
    }

    const addedInstruction = await Instruction.create(validInstruction)

    revalidatePath("/settings/instructions")

    setNotification(addedInstruction.content)

    return JSON.parse(JSON.stringify(addedInstruction))
  } catch (error) {
    console.error("Error adding instruction:", error)
    return {
      error:
        error instanceof Error ? error.message : "Failed to add instruction",
    }
  }
}

export const setNotification = async (content: string) => {
  const sessionUser: TUser | null = await getSessionUser()
  if (!sessionUser) throw new Error("User not found")

  const chatUsers = await Chat.find({ personaId: sessionUser._id })

  const ntUsers = chatUsers
    .filter((n) => n._id !== sessionUser._id)
    .map((n) => n.userId.toString())

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `Use this context data and make it as a clickbait notification for a third person, and never explain it give a single text direct answer(in just "{title}::{message}" format always): ${content}`,
  })

  const [title, message] = text.split("::").map((str) => str.trim())
  console.log(text)

  await sendNotificationToMany(ntUsers, title, message)
}

export const updateInstruction = async (
  id: string,
  type?: string,
  content?: string,
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

    if (type) instruction.type = type
    if (content) instruction.content = content

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
