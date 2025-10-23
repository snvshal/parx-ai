"use server"

import connectToDatabase from "@/lib/db"
import { Chat } from "@/models/chat.model"
import { User } from "@/models/user.model"
import { TUser } from "@/schemas/user.schema"

export type TPersona = {
  id: string
  username: string
  name: string
  avatar: string
  chatCount: number
}

export type TPersonaResponse = {
  success: boolean
  data: TPersona[]
}

export const getPeople = async (): Promise<TPersonaResponse> => {
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

    const personas: TPersona[] = await Promise.all(
      users.map(async (user) => {
        const chatCount = await Chat.countDocuments({ personaId: user._id })
        return {
          id: String(user._id),
          username: user.username,
          name: user.name,
          avatar: user.avatar as string,
          chatCount,
        }
      }),
    )

    return { success: true, data: personas }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, data: [] }
  }
}
