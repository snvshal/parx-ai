import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { User } from "@/models/user.model"
import connectToDatabase from "@/lib/db"
import { TInstruction, TUser, userSchema } from "@/schemas/user.schema"
import { Types } from "mongoose"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDatabase()

        // Generate username from email
        const username = user.email?.split("@")[0].toLowerCase()

        const instruction: TInstruction = {
          _id: new Types.ObjectId(),
          type: "About me",
          content: `My name is ${user.name}. I'm here to chat and share my thoughts. I enjoy talking about different topics, and you can ask me anything about me!`,
          images: [],
          links: [],
        }

        const userData = {
          email: user.email,
          name: user.name?.slice(0, 20),
          username: username,
          avatar: user.image,
          socialLink: "",
          firstMessage: `Hi! I'm ${user.name}. Happy to chat about my hobbies, experiences, or anything fun that comes up! 😊`,
          instructions: [instruction] as TInstruction[],
        }

        const validatedData = userSchema.parse(userData)

        const existingUser: TUser | null = await User.findOne({
          email: user.email,
        })
        if (!existingUser) {
          await User.create(validatedData)
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },

    async session({ session }) {
      if (session.user) {
        try {
          await connectToDatabase()

          const dbUser: TUser | null = await User.findOne({
            email: session.user.email,
          })
          if (dbUser) {
            session.user.id = dbUser._id?.toString() || ""
            session.user.username = dbUser.username
            session.user.instructions = dbUser.instructions
          }
        } catch (error) {
          console.error("Error in session callback:", error)
        }
      }
      return session
    },

    async jwt({ trigger, session, token, user, account }) {
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user }
      }

      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id

        const dbUser: TUser | null = await User.findOne({ email: user.email })
        if (dbUser) {
          token.id = dbUser._id?.toString()
          token.username = dbUser.username
          token.name = dbUser.name
          token.image = dbUser.avatar
        }
      }

      return token
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
