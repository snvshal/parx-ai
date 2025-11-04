import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { getInstructionsByUserId } from "@/app/actions/so"
import { getSessionUser } from "@/app/actions/session-user"
import { getUserByUsername, saveMessage } from "@/app/actions/chat"
import { Types } from "mongoose"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, username } = await req.json()

    if (!messages?.length) throw new Error("Messages cannot be empty.")

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user" && !lastMessage.content.trim())
      throw new Error("User's last message cannot be empty.")

    const [persona, sessionUser] = await Promise.all([
      getUserByUsername(username),
      getSessionUser(),
    ])
    if (!persona) throw new Error("Persona not found.")

    let chat = null
    if (sessionUser) {
      chat = await Chat.findOne({
        userId: sessionUser._id,
        personaId: persona._id,
      })
      if (!chat) throw new Error("Chat not found.")

      await saveMessage(String(persona._id), {
        role: "user",
        content: lastMessage.content,
      })
    }

    const systemInstruction = await getInstructionsByUserId(String(persona._id))
    const messagesWithSystem = [
      { role: "system", content: systemInstruction },
      ...messages,
    ]

    let assistantMessageId: string | null = null
    if (sessionUser && chat) {
      const assistantMessage = await Message.create({
        chatId: chat._id,
        userId: sessionUser._id,
        personaId: persona._id,
        type: "text",
        role: "assistant",
        content: "",
      })
      assistantMessageId = String(assistantMessage._id)
      chat.lastMessage = assistantMessage._id as Types.ObjectId
      await chat.save()
    }

    let buffer = ""
    let flushTimer: NodeJS.Timeout | null = null
    const FLUSH_INTERVAL = 300

    const flushContent = async (final = false) => {
      if (!assistantMessageId || !buffer.trim()) return
      try {
        await Message.findByIdAndUpdate(assistantMessageId, { content: buffer })
      } catch (err) {
        console.error("DB flush error:", err)
      }
      if (final && flushTimer) clearTimeout(flushTimer)
    }

    const debouncedFlush = () => {
      if (flushTimer) clearTimeout(flushTimer)
      flushTimer = setTimeout(flushContent, FLUSH_INTERVAL)
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: messagesWithSystem,

      onChunk: ({ chunk }) => {
        if (assistantMessageId && chunk.type === "text-delta") {
          buffer += chunk.textDelta
          debouncedFlush()
        }
      },

      onFinish: async () => {
        await flushContent(true)
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 },
    )
  }
}
