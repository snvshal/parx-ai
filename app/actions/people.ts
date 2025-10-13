"use server"

import connectToDatabase from "@/lib/db"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"
import { getServerSession } from "next-auth"

export const getPeople = async (): Promise<{
  success: boolean
  data: TUser[]
}> => {
  try {
    await connectToDatabase()

    const users: TUser[] = await User.find(
      {},
      {
        _id: 1,
        username: 1,
        name: 1,
        avatar: 1,
      },
    )

    return { success: true, data: users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, data: [] }
  }
}
