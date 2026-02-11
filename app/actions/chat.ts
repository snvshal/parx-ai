"use server"

import connectToDatabase from "@/lib/db"
import { redis } from "@/lib/redis"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { User } from "@/models/user.model"
import { TChat } from "@/schemas/chat.schema"
import { TMessage } from "@/schemas/message.schema"
import { TUser } from "@/schemas/user.schema"
import { UIMessage } from "ai"
import { getSessionUser } from "@/app/actions/session-user"
import { revalidatePath } from "next/cache"
import { HydratedDocument, Types } from "mongoose"
import { ps } from "@/lib/utils"

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  USER: 3600, // 1 hour
  CHATS: 300, // 5 minutes
  MESSAGES: 300, // 5 minutes
}

// Cache key generators
const getCacheKey = {
  user: (username: string) => `user:${username}`,
  userById: (userId: string) => `user:id:${userId}`,
  chats: (userId: string) => `chats:${userId}`,
  chat: (userId: string, personaId: string) => `chat:${userId}:${personaId}`,
  messages: (userId: string, personaId: string) =>
    `messages:${userId}:${personaId}`,
}

export const getUserByUsername = async (
  username: string,
): Promise<TUser | null> => {
  try {
    const cacheKey = getCacheKey.user(username)
    const cached = await redis.get(cacheKey)
    if (cached) return cached as TUser

    await connectToDatabase()
    const user = await User.findOne({ username })
    if (!user) return null

    const serializedUser = ps(user)

    await redis.setex(cacheKey, CACHE_TTL.USER, serializedUser)

    return serializedUser
  } catch (error) {
    console.error(`Error fetching user by username "${username}":`, error)
    return null
  }
}

export type PopulatedChat = HydratedDocument<TChat> & {
  userId: TUser
  personaId: TUser
  lastMessage?: TMessage
}

export const getChats = async (): Promise<PopulatedChat[]> => {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return []

    const cacheKey = getCacheKey.chats(String(sessionUser._id))
    const cached = await redis.get(cacheKey)
    if (cached) return cached as PopulatedChat[]

    await connectToDatabase()
    const chats = await Chat.find({ userId: sessionUser._id })
      .populate("userId")
      .populate("personaId")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })

    const serializedChats = ps(chats) as PopulatedChat[]

    await redis.setex(cacheKey, CACHE_TTL.CHATS, serializedChats)

    return serializedChats
  } catch (error) {
    console.error(`Error fetching chats for user`, error)
    return []
  }
}

export const getChat = async (
  personaId: string,
): Promise<PopulatedChat | null> => {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return null

    const cacheKey = getCacheKey.chat(String(sessionUser._id), personaId)
    const cached = await redis.get(cacheKey)
    if (cached) return cached as PopulatedChat

    await connectToDatabase()
    const persona = await User.findById(personaId)
    if (!persona) return null

    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId: persona._id,
    })
      .populate("userId")
      .populate("personaId")
      .populate("lastMessage")

    if (!chat) return null

    const serializedChat = ps(chat) as PopulatedChat
    await redis.setex(cacheKey, CACHE_TTL.CHATS, serializedChat)
    return serializedChat
  } catch (error) {
    console.error(`Error fetching chats for user "${personaId}":`, error)
    return null
  }
}

export const deleteChat = async (
  personaId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser)
      return { success: false, message: "User not authenticated." }

    const persona = await User.findById(personaId)
    if (!persona) {
      return { success: false, message: "Persona not found." }
    }

    const chat = await Chat.findOneAndDelete({
      userId: sessionUser._id,
      personaId: persona._id,
    })
    if (!chat) return { success: false, message: "Chat not found." }

    const userIdStr = String(sessionUser._id)
    await Promise.all([
      redis.del(getCacheKey.chats(userIdStr)),
      redis.del(getCacheKey.chat(userIdStr, personaId)),
      redis.del(getCacheKey.messages(userIdStr, personaId)),
    ])

    revalidatePath("/")

    return { success: true, message: "Chat deleted." }
  } catch (error) {
    console.error(`Error fetching chats for user:`, error)
    return { success: false, message: "Some error occurred." }
  }
}

export const getMessages = async (personaId: string): Promise<UIMessage[]> => {
  try {
    await connectToDatabase()

    const [persona, sessionUser] = await Promise.all([
      User.findById(personaId).lean(),
      getSessionUser(),
    ])

    if (!persona) throw new Error("Persona not found")

    // If the viewer is not authenticated, just return the persona's first message
    if (!sessionUser) {
      return [
        {
          id: "initial",
          role: "assistant",
          parts: [{ type: "text", text: persona.firstMessage }],
          metadata: { createdAt: new Date() },
        },
      ]
    }

    const userIdStr = String(sessionUser._id)
    const cacheKey = getCacheKey.messages(userIdStr, personaId)
    const cached = await redis.get(cacheKey)
    if (cached) return cached as UIMessage[]

    // Look up (or lazily create) the chat for this user/persona pair.
    // This avoids the heavier populated query in getChat.
    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId,
    }).lean()

    if (!chat) {
      const newChat = await Chat.create({
        userId: sessionUser._id,
        personaId,
      })

      const firstMessage = await Message.create({
        chatId: newChat._id,
        userId: sessionUser._id,
        personaId,
        type: "text",
        role: "assistant",
        content: persona.firstMessage,
      })

      newChat.lastMessage = firstMessage._id as Types.ObjectId
      await newChat.save()

      const messages: UIMessage[] = [
        {
          id: String(firstMessage._id),
          role: firstMessage.role,
          parts: [{ type: "text", text: firstMessage.content }],
          metadata: { createdAt: firstMessage.createdAt },
        },
      ]

      await redis.setex(cacheKey, CACHE_TTL.MESSAGES, messages)

      // Refresh chats cache so sidebar and other consumers see the new chat.
      await redis.del(getCacheKey.chats(userIdStr))

      return messages
    }

    const messagesDocs: TMessage[] = await Message.find({
      chatId: chat._id,
      personaId,
    }).sort({ createdAt: 1 })

    if (chat.unreadCount) {
      await Chat.updateMany(
        { personaId, userId: sessionUser._id },
        { $set: { unreadCount: 0 } },
      )
      await Promise.all([
        redis.del(getCacheKey.chats(userIdStr)),
        redis.del(getCacheKey.chat(userIdStr, personaId)),
      ])
    }

    const uiMessages: UIMessage[] =
      messagesDocs.map(
        (msg: TMessage) =>
          ({
            id: String(msg._id),
            role: msg.role,
            parts: [{ type: "text", text: msg.content }],
            metadata: { createdAt: msg.createdAt },
          }) as UIMessage,
      ) || []

    await redis.setex(cacheKey, CACHE_TTL.MESSAGES, uiMessages)

    return uiMessages
  } catch (error) {
    console.error(`Error fetching messages for chat "${personaId}":`, error)
    return []
  }
}

export const saveMessage = async (
  personaId: string,
  message: Pick<TMessage, "role" | "content">,
): Promise<{ success: boolean; message: TMessage | null }> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) return { success: false, message: null }

    const chat = await Chat.findOne({ userId: sessionUser._id, personaId })
    if (!chat) throw new Error("Chat not found")

    const newMessage = await Message.create({
      chatId: chat._id,
      userId: sessionUser._id,
      personaId,
      type: "text",
      ...message,
    })

    chat.lastMessage = newMessage._id as Types.ObjectId
    await chat.save()

    const userIdStr = String(sessionUser._id)
    await Promise.all([
      redis.del(getCacheKey.messages(userIdStr, personaId)),
      redis.del(getCacheKey.chats(userIdStr)),
      redis.del(getCacheKey.chat(userIdStr, personaId)),
    ])

    return ps({ success: true, message: newMessage })
  } catch (error) {
    console.error(`Error saving message for chat "${personaId}":`, error)
    return { success: false, message: null }
  }
}

export const deleteMessages = async (
  personaId: string,
): Promise<{
  success: boolean
  message?: string
  firstMessage?: UIMessage
}> => {
  try {
    await connectToDatabase()

    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return { success: false, message: "User not authenticated." }
    }

    const persona = await User.findById(personaId)
    if (!persona) {
      return { success: false, message: "Persona not found." }
    }

    const result = await Message.deleteMany({
      userId: sessionUser._id,
      personaId: persona._id,
    })

    if (result.deletedCount === 0) {
      return { success: false, message: "No messages found to delete." }
    }

    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId: persona._id,
    })
    if (!chat) {
      return { success: false, message: "No messages found to delete." }
    }

    const fm = await Message.create({
      chatId: chat._id,
      userId: sessionUser._id,
      personaId: persona._id,
      type: "text",
      role: "assistant",
      content: persona.firstMessage,
    })

    const firstMessage: UIMessage = {
      id: String(fm._id),
      role: fm.role,
      parts: [{ type: "text", text: fm.content }],
      metadata: { createdAt: fm.createdAt },
    }

    const userIdStr = String(sessionUser._id)
    await Promise.all([
      redis.del(getCacheKey.messages(userIdStr, personaId)),
      redis.del(getCacheKey.chats(userIdStr)),
      redis.del(getCacheKey.chat(userIdStr, personaId)),
    ])

    revalidatePath(`/m/${persona.username}`)

    return {
      success: true,
      message: "Messages deleted successfully.",
      firstMessage,
    }
  } catch (error) {
    console.error(`Error deleting messages for persona:`, error)
    return {
      success: false,
      message: "An error occurred while deleting messages.",
    }
  }
}
