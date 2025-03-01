"use server"

import connectToDatabase from "@/lib/db"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"

export const getUserByUsername = async (
  username: string
): Promise<TUser | null> => {
  try {
    await connectToDatabase()
    const userData = await User.findOne({ username })
    return userData || null
  } catch (error) {
    console.error(`Error fetching user by username "${username}":`, error)
    return null
  }
}
