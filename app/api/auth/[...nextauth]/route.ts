import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { User } from "@/models/user.model"
import connectToDatabase from "@/lib/db"
import { TPUser, TUser, UserZodSchema } from "@/schemas/user.schema"
import { InstructionZodSchema } from "@/schemas/instruction.schema"
import { Instruction } from "@/models/instruction.model"

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

        const existingUser: TUser | null = await User.findOne({
          email: user.email,
        })

        if (!existingUser) {
          const baseUsername = user.email!.split("@")[0].toLowerCase()
          let username = baseUsername

          const isUsernameTaken = await User.exists({ username })
          if (isUsernameTaken) {
            const suffix =
              Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
            username = `${baseUsername}_${suffix}`
          }

          const userData: TPUser = {
            email: user.email!,
            name: user.name?.slice(0, 20) || "New User",
            username,
            avatar: user.image || "",
            socialLink: "",
            firstMessage: `Hi! I'm ${user.name || "a new user"}. Happy to chat about my hobbies, experiences, or anything fun that comes up! 😊`,
          }

          const validatedData = UserZodSchema.parse(userData)
          const newUser = await User.create(validatedData)

          const customInstructions = [
            {
              userId: newUser._id?.toString(),
              type: "How I talk and behave",
              content: "I am friendly, witty, and concise in responses.",
              mediaUrls: [],
              links: [],
            },
            {
              userId: newUser._id?.toString(),
              type: "What topics I love",
              content: "I'm into tech, gaming, fitness, and travel.",
              mediaUrls: [],
              links: [],
            },
          ]

          const validatedInstructions = customInstructions.map((i) =>
            InstructionZodSchema.parse(i),
          )
          await Instruction.insertMany(validatedInstructions)
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
