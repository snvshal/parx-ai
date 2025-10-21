import "server-only"

import connectToDatabase from "@/lib/db"
import { getServerSession } from "next-auth"
import { TUser } from "@/schemas/user.schema"
import { User } from "@/models/user.model"
import { ContextUser } from "@/hooks/use-session-user"

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

export const getContextUser = async (): Promise<ContextUser | null> => {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) return null

    const contextUser = {
      id: sessionUser._id?.toString(),
      username: sessionUser.username,
      name: sessionUser.name,
      email: sessionUser.email,
      avatar: sessionUser.avatar,
    } as ContextUser

    return contextUser
  } catch (error) {
    return null
  }
}
