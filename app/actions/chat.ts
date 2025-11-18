"use server"

import connectToDatabase from "@/lib/db"
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

export type PopulatedChat = HydratedDocument<TChat> & {
  userId: TUser
  personaId: TUser
  lastMessage?: TMessage
}

export const getChats = async (): Promise<PopulatedChat[]> => {
  "use cache: private"
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) return []

    const chats = await Chat.find({ userId: sessionUser?._id })
      .populate("userId")
      .populate("personaId")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })

    return ps(chats) as unknown as PopulatedChat[]
  } catch (error) {
    console.error(`Error fetching chats for user`, error)
    return []
  }
}

export const getChat = async (
  personaId: string,
): Promise<PopulatedChat | null> => {
  try {
    await connectToDatabase()
    const sessionUser = await getSessionUser()
    if (!sessionUser) return null

    const persona = await User.findById(personaId)
    if (!persona) return null

    const chat = await Chat.findOne({
      userId: sessionUser._id,
      personaId: persona._id,
    })
      .populate("userId")
      .populate("personaId")
      .populate("lastMessage")

    return chat as unknown as PopulatedChat
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

    const persona = await User.findById(personaId).lean()
    if (!persona) throw new Error("Persona not found")

    const sessionUser = await getSessionUser()

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

      newChat.lastMessage = firstMessage._id as Types.ObjectId
      await newChat.save()

      return [
        {
          id: String(firstMessage._id),
          role: firstMessage.role,
          parts: [{ type: "text", text: firstMessage.content }],
          metadata: { createdAt: firstMessage.createdAt },
        },
      ]
    }

    const messages: TMessage[] = await Message.find({
      chatId: chat._id,
      personaId,
    }).sort({ createdAt: 1 })

    return (
      messages.map(
        (msg: TMessage) =>
          ({
            id: String(msg._id),
            role: msg.role,
            parts: [{ type: "text", text: msg.content }],
            metadata: { createdAt: msg.createdAt },
          }) as UIMessage,
      ) || []
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

    chat.lastMessage = newMessage._id as Types.ObjectId
    await chat.save()

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

    const firstMessage = {
      id: String(fm._id),
      role: fm.role,
      parts: [{ type: "text", text: fm.content }],
      metadata: { createdAt: fm.createdAt },
    } as UIMessage

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
