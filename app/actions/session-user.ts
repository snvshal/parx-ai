import "server-only"

import connectToDatabase from "@/lib/db"
import { getServerSession } from "next-auth"
import { TUser } from "@/schemas/user.schema"
import { User } from "@/models/user.model"

export const getSessionUser = async (): Promise<TUser | null> => {
  try {
    await connectToDatabase()
    const session = await getServerSession()
    if (!session?.user) return null

    const user: TUser | null = await User.findOne({ email: session.user.email })
    if (!user) throw new Error("User not found")

    return user
  } catch (error) {
    console.error("Error fetching session user:", error)
    return null
  }
}
