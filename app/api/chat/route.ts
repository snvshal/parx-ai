import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { getInstructionsByUserId } from "@/app/actions/so"
import { getSessionUser } from "@/app/actions/session-user"
import { getUserByUsername, saveMessage } from "@/app/actions/chat"

export const maxDuration = 30
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { messages, username } = await req.json()

    if (!messages?.length) {
      throw new Error("Messages cannot be null, undefined, or an empty array.")
    }

    const lastMessage = messages[messages.length - 1]
    const lastMessageText = lastMessage?.content

    if (lastMessage.role === "user" && !lastMessageText.trim()) {
      throw new Error(
        "The user's last prompt cannot be empty or only whitespace.",
      )
    }

    const [persona, sessionUser] = await Promise.all([
      getUserByUsername(username),
      getSessionUser(),
    ])

    if (!persona) throw new Error("Persona not found")

    let chat = null
    if (sessionUser) {
      chat = await Chat.findOne({
        userId: sessionUser._id,
        personaId: persona._id,
      })
      if (!chat) throw new Error("Chat not found")

      await saveMessage(String(persona._id), {
        role: "user",
        content: lastMessageText,
      })
    }

    const systemInstructionContent = await getInstructionsByUserId(
      String(persona._id),
    )

    const messagesWithSystemInstruction = [
      { role: "system", content: systemInstructionContent },
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
      assistantMessageId = assistantMessage._id.toString()
      chat.lastMessage = assistantMessage._id
      await chat.save()
    }

    let runningText = ""
    let flushTimer: NodeJS.Timeout | null = null

    const debouncedFlush = (id: string, text: string) => {
      if (flushTimer) clearTimeout(flushTimer)
      flushTimer = setTimeout(() => {
        Message.findByIdAndUpdate(id, { $set: { content: text } }).catch(
          (err) => console.error("Debounced update failed:", err),
        )
      }, 200)
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: messagesWithSystemInstruction,
      onChunk: ({ chunk }) => {
        if (assistantMessageId && chunk.type === "text-delta") {
          runningText += chunk.textDelta
          debouncedFlush(assistantMessageId, runningText)
        }
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
