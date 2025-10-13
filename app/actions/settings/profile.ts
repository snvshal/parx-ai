"use server"

import { getSessionUser } from "@/app/actions/session-user"
import { ProfileSettingsProps } from "@/components/settings/profile"
import connectToDatabase from "@/lib/db"
import { formatZodError } from "@/lib/utils"
import { User } from "@/models/user.model"
import { UserSchema } from "@/schemas/user.schema"
import { revalidatePath } from "next/cache"

export const getProfile = async (): Promise<ProfileSettingsProps> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error("Unauthorized")

    return {
      username: sessionUser.username,
      name: sessionUser.name,
      avatar: sessionUser.avatar || "",
      socialLink: sessionUser.socialLink || "",
      firstMessage: sessionUser.firstMessage || "",
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
  >,
): Promise<{ success: boolean; message: string }> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error("Unauthorized")

    const validationResult = UserSchema.pick({
      username: true,
      name: true,
      avatar: true,
      socialLink: true,
      firstMessage: true,
    }).safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: formatZodError(validationResult.error),
      }
    }

    const { username, name, avatar, socialLink, firstMessage } =
      validationResult.data

    if (username && username !== sessionUser.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return { success: false, message: "Username already taken" }
      }
      sessionUser.username = username
    }

    if (name && name !== sessionUser.name) sessionUser.name = name
    if (avatar && avatar !== sessionUser.avatar) sessionUser.avatar = avatar
    if (socialLink !== sessionUser.socialLink)
      sessionUser.socialLink = socialLink
    if (firstMessage && firstMessage !== sessionUser.firstMessage)
      sessionUser.firstMessage = firstMessage

    await sessionUser.save()
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
