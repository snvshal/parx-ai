import "server-only"

import { User } from "@/models/user.model"
import connectToDatabase from "@/lib/db"
import type { TUser } from "@/schemas/user.schema"

export async function getPersonaById(personaId: string): Promise<TUser | null> {
  await connectToDatabase()

  try {
    const persona = (await User.findById(personaId).lean()) as TUser | null
    return persona
  } catch (error) {
    console.error("Error fetching persona by ID:", error)
    return null
  }
}
