"use server"

import connectToDatabase from "@/lib/db"
import { User } from "@/models/user.model"
import {
  TInstruction,
  TUser,
  userSchema,
  instructionSchema,
} from "@/schemas/user.schema"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { Types } from "mongoose"
import { formatZodError } from "@/lib/utils"
import { ProfileSettingsProps } from "./components"

export const getSessionUser = async (): Promise<TUser> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    return user
  } catch (error) {
    console.error("Error fetching instructions:", error)
    throw new Error("Failed to fetch instructions")
  }
}

export const getInstructions = async (): Promise<TInstruction[]> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    return user.instructions || []
  } catch (error) {
    console.error("Error fetching instructions:", error)
    throw new Error("Failed to fetch instructions")
  }
}

export const addInstruction = async (
  newInstruction: Omit<TInstruction, "_id">
): Promise<TInstruction | { error: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const validationResult = instructionSchema.safeParse(newInstruction)
    if (!validationResult.success) {
      return { error: formatZodError(validationResult.error) }
    }

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    const instructionWithId: TInstruction = {
      ...validationResult.data,
      _id: new Types.ObjectId(),
    }

    user.instructions.push(instructionWithId)
    await user.save()

    revalidatePath("/settings")

    return JSON.parse(JSON.stringify(instructionWithId))
  } catch (error) {
    console.error("Error adding instruction:", error)
    return {
      error:
        error instanceof Error ? error.message : "Failed to add instruction",
    }
  }
}

export const updateInstruction = async (
  id: string,
  type?: string,
  content?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    const instruction = user.instructions.find(
      (instruction) => instruction._id.toString() === id
    )

    if (!instruction) throw new Error("Instruction not found")

    const updatedInstruction = {
      ...instruction,
      type,
      content,
    }

    const validationResult = instructionSchema.safeParse(updatedInstruction)
    if (!validationResult.success) {
      return { success: false, message: formatZodError(validationResult.error) }
    }

    if (type) instruction.type = type
    if (content) instruction.content = content

    await user.save()
    revalidatePath("/settings")

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
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()

    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    user.instructions = user.instructions.filter(
      (inst: TInstruction) => inst._id.toString() !== id
    )
    await user.save()

    revalidatePath("/settings")
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

export const getProfile = async (): Promise<ProfileSettingsProps> => {
  try {
    await connectToDatabase()
    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    return {
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      socialLink: user.socialLink,
      firstMessage: user.firstMessage,
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    return {
      username: "",
      name: "",
      avatar: "",
      socialLink: "",
      firstMessage: "",
    }
  }
}

export const updateProfile = async (
  data: Partial<
    Record<
      "username" | "name" | "avatar" | "socialLink" | "firstMessage",
      string
    >
  >
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()
    const session = await getServerSession()
    if (!session?.user) throw new Error("Unauthorized")

    const validationResult = userSchema
      .pick({
        username: true,
        name: true,
        avatar: true,
        socialLink: true,
        firstMessage: true,
      })
      .safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: formatZodError(validationResult.error),
      }
    }

    const { username, name, avatar, socialLink, firstMessage } =
      validationResult.data

    const user = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return { success: false, message: "Username already taken" }
      }
      user.username = username
    }

    if (name && name !== user.name) user.name = name
    if (avatar && avatar !== user.avatar) user.avatar = avatar
    if (socialLink !== user.socialLink) user.socialLink = socialLink
    if (firstMessage && firstMessage !== user.firstMessage)
      user.firstMessage = firstMessage

    await user.save()
    revalidatePath("/settings/profile")

    return { success: true, message: "Profile updated successfully!" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}
