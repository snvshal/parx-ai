import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { openrouter } from "@/lib/ai"
import { NextRequest } from "next/server"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { selectRelevantInstructions } from "@/app/actions/so"
import { CHAT_MODEL } from "@/lib/constants/models"
import { buildSystemInstruction } from "@/lib/utils"
import { getSessionUser } from "@/app/actions/session-user"
import { getUserByUsername, saveMessage } from "@/app/actions/chat"
import { Types } from "mongoose"
import { SYSTEM_INSTRUCTIONS } from "@/lib/constants/system-instructions"

export const maxDuration = 30

const MAX_MESSAGES = 30
const FLUSH_CHUNK_SIZE = 100

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()
    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "Messages cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const last = messages[messages.length - 1]
    const username = (last.metadata as { username?: string }).username as string

    const lastText =
      last.parts?.find((part) => part.type === "text")?.text ?? ""

    if (last.role === "user" && !lastText.trim()) {
      return new Response(JSON.stringify({ error: "User's last message cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const persona = await getUserByUsername(username)
    if (!persona) {
      return new Response(JSON.stringify({ error: "Persona not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const sessionUser = await getSessionUser()

    let chat = null
    if (sessionUser) {
      chat = await Chat.findOne({
        userId: sessionUser._id,
        personaId: persona._id,
      })
      if (!chat) {
        return new Response(JSON.stringify({ error: "Chat not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      await saveMessage(String(persona._id), {
        role: "user",
        content: lastText,
      })
    }

    const relevantInstructions = await selectRelevantInstructions(
      String(persona._id),
      lastText,
    )
    const systemInstruction =
      relevantInstructions.length > 0
        ? buildSystemInstruction(relevantInstructions)
        : SYSTEM_INSTRUCTIONS.style

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
    let flushChain: Promise<void> = Promise.resolve()

    const trimmedMessages =
      messages.length > MAX_MESSAGES
        ? messages.slice(-MAX_MESSAGES)
        : messages

    const result = streamText({
      model: openrouter.chat(CHAT_MODEL),
      system: systemInstruction,
      messages: await convertToModelMessages(trimmedMessages),
      onChunk: ({ chunk }) => {
        if (assistantMessageId && chunk.type === "text-delta") {
          buffer += chunk.text
          if (buffer.length >= FLUSH_CHUNK_SIZE) {
            const content = buffer
            flushChain = flushChain
              .then(() => void Message.findByIdAndUpdate(assistantMessageId, { content }))
              .catch(console.error)
          }
        }
      },
      onFinish: async () => {
        await flushChain.catch(console.error)
        if (assistantMessageId && buffer.trim()) {
          await Message.findByIdAndUpdate(assistantMessageId, { content: buffer })
        }
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
