"use server"

import z from "zod"
import connectToDatabase from "@/lib/db"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { User } from "@/models/user.model"
import { ChatSchema, TChat } from "@/schemas/chat.schema"
import { TMessage } from "@/schemas/message.schema"
import { TUser } from "@/schemas/user.schema"
import { Message as SDKMessage } from "ai"
import { getSessionUser } from "@/app/actions/session-user"
import { revalidatePath } from "next/cache"

export const getUserByUsername = async (
  username: string,
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

export type ChatSession = z.infer<typeof ChatSchema> & {
  chatId: string
  persona: TUser
  lastMessageContent: string
}

export const getChats = async (): Promise<ChatSession[]> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) return []

    const chats = await Chat.find({ userId: sessionUser._id })
      .sort({ updatedAt: -1 })
      .lean()

    let chatSessions: ChatSession[] = []
    await Promise.all(
      chats.map(async (chat) => {
        const persona = await User.findById(chat.personaId).lean()
        const lastMessage = await Message.findById(chat.lastMessage).lean()
        chatSessions.push({
          ...chat,
          chatId: chat._id.toString(),
          persona: persona as TUser,
          lastMessageContent: lastMessage?.content as string,
        })
      }),
    )
    return JSON.parse(JSON.stringify(chatSessions))
  } catch (error) {
    console.error(`Error fetching chats for user`, error)
    return []
  }
}

export const getChat = async (personaId: string): Promise<TChat | null> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) return null

    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId,
    }).lean()
    return chat || null
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

    const chat = await Chat.findOneAndDelete({
      userId: sessionUser._id,
      personaId,
    })
    if (!chat) return { success: false, message: "Chat not found." }

    revalidatePath("/")

    return { success: true, message: "Chat deleted." }
  } catch (error) {
    console.error(`Error fetching chats for user "${personaId}":`, error)
    return { success: false, message: "Some error occurred." }
  }
}

export const getMessages = async (personaId: string): Promise<SDKMessage[]> => {
  try {
    await connectToDatabase()

    const persona = await User.findById(personaId).lean()
    if (!persona) throw new Error("Persona not found")

    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return [
        {
          id: "initial",
          role: "assistant",
          content: persona.firstMessage,
          createdAt: new Date(),
          parts: [{ type: "text", text: persona.firstMessage }],
        },
      ]
    }

    const chat = await getChat(personaId)

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

      newChat.lastMessage = firstMessage._id
      await newChat.save()

      return [
        {
          id: firstMessage._id.toString(),
          role: firstMessage.role,
          content: firstMessage.content,
          createdAt: firstMessage.createdAt,
          parts: [{ type: "text", text: firstMessage.content }],
        },
      ]
    }

    const messages: TMessage[] = await Message.find({
      chatId: chat._id,
      personaId,
    }).sort({ createdAt: 1 })

    return (
      messages.map((msg: TMessage) => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content || "",
        createdAt: msg.createdAt,
        parts: [{ type: "text", text: msg.content }],
      })) || []
    )
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

    chat.lastMessage = newMessage._id
    await chat.save()

    return JSON.parse(JSON.stringify({ success: true, message: newMessage }))
  } catch (error) {
    console.error(`Error saving message for chat "${personaId}":`, error)
    return { success: false, message: null }
  }
}

export const deleteMessages = async (
  personaId: string,
): Promise<{ success: boolean; message?: string }> => {
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
      personaId,
    })

    if (result.deletedCount === 0) {
      return { success: false, message: "No messages found to delete." }
    }

    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId,
    })
    if (!chat) {
      return { success: false, message: "No messages found to delete." }
    }

    await Message.create({
      chatId: chat._id,
      userId: sessionUser._id,
      personaId,
      type: "text",
      role: "assistant",
      content: persona.firstMessage,
    })

    revalidatePath(`/m/${persona.username}`)

    return { success: true, message: "Messages deleted successfully." }
  } catch (error) {
    console.error(`Error deleting messages for persona "${personaId}":`, error)
    return {
      success: false,
      message: "An error occurred while deleting messages.",
    }
  }
}
