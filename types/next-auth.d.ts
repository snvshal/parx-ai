import { DefaultSession } from "next-auth"
import { TInstruction } from "@/schemas/user"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
  }
}
