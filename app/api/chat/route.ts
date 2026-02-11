import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { withSupermemory } from "@supermemory/tools/ai-sdk"
import { google } from "@ai-sdk/google"
import { NextRequest } from "next/server"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { classifyIntent, getInstructionsByUserId } from "@/app/actions/so"
import { getSessionUser } from "@/app/actions/session-user"
import { getUserByUsername, saveMessage } from "@/app/actions/chat"
import { Types } from "mongoose"
import { SYSTEM_INSTRUCTIONS } from "@/lib/constants/system-instructions"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()
    if (!messages?.length) throw new Error("Messages cannot be empty.")

    const last = messages[messages.length - 1]
    const username = (last.metadata as { username?: string }).username as string

    const lastText =
      last.parts?.find((part) => part.type === "text")?.text ?? ""

    if (last.role === "user" && !lastText.trim())
      throw new Error("User's last message cannot be empty.")

    const persona = await getUserByUsername(username)
    if (!persona) throw new Error("Persona not found.")
    const sessionUser = await getSessionUser()

    let chat = null
    if (sessionUser) {
      chat = await Chat.findOne({
        userId: sessionUser._id,
        personaId: persona._id,
      })
      if (!chat) throw new Error("Chat not found.")

      await saveMessage(String(persona._id), {
        role: "user",
        content: lastText,
      })
    }

    const needsContext = await classifyIntent(lastText)

    const systemInstruction = needsContext
      ? await getInstructionsByUserId(String(persona._id), lastText)
      : SYSTEM_INSTRUCTIONS.style

    const containerTag = sessionUser
      ? `user-${sessionUser._id}-persona-${persona._id}`
      : `guest-persona-${persona._id}`

    const modelWithMemory = withSupermemory(
      google("gemini-2.5-flash"),
      containerTag,
    )

    let assistantMessageId: string | null = null
    if (sessionUser && chat) {
      const assistantMsg = await Message.create({
        chatId: chat._id,
        userId: sessionUser._id,
        personaId: persona._id,
        type: "text",
        role: "assistant",
        content: "",
      })
      assistantMessageId = String(assistantMsg._id)
      chat.lastMessage = assistantMsg._id as Types.ObjectId
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
      model: modelWithMemory,
      system: systemInstruction,
      messages: convertToModelMessages(messages),
      onChunk: ({ chunk }) => {
        if (assistantMessageId && chunk.type === "text-delta") {
          buffer += chunk.text
          debouncedFlush()
        }
      },
      onFinish: async () => {
        await flushContent(true)
      },
    })

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return { createdAt: new Date() }
        }
      },
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
