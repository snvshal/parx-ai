import { type UIMessage, toUIMessageStream, createUIMessageStreamResponse } from "ai"
import { NextRequest } from "next/server"
import { Chat } from "@/models/chat.model"
import { Message } from "@/models/message.model"
import { Agent } from "@/agent"
import { getSessionUser } from "@/app/actions/session-user"
import { getUserByUsername, saveMessage } from "@/app/actions/chat"
import { Types } from "mongoose"

export const maxDuration = 30

const MAX_MESSAGES = 30

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()
    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "Messages cannot be empty." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const last = messages[messages.length - 1]
    const username = (last.metadata as { username?: string }).username as string

    const lastText =
      last.parts?.find((part) => part.type === "text")?.text ?? ""

    if (last.role === "user" && !lastText.trim()) {
      return new Response(
        JSON.stringify({ error: "User's last message cannot be empty." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
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

    let fullText = ""
    let lastSavedLength = 0

    const trimmedMessages =
      messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages
    const modelMessages = trimmedMessages.filter(
      (m) => !(m.metadata as Record<string, unknown>)?.isFirstMessage,
    )

    const statusQueue: string[] = []
    let controllerRef: ReadableStreamDefaultController<any> | null = null

    const enqueueStatus = (status: string) => {
      const chunk = {
        type: "data-agent-status",
        data: { status },
        transient: true,
      }
      if (controllerRef) {
        controllerRef.enqueue(chunk)
      } else {
        statusQueue.push(status)
      }
    }

    const agent = new Agent(String(persona._id))

    const result = await agent.stream({
      messages: modelMessages,
      chatId: chat ? String(chat._id) : undefined,
      user: sessionUser
        ? { name: sessionUser.name, avatar: sessionUser.avatar }
        : undefined,
      onStatus: enqueueStatus,
      onChunk: ({ chunk }) => {
        if (assistantMessageId && chunk.type === "text-delta") {
          fullText += chunk.text
          if (fullText.length - lastSavedLength >= 100) {
            Message.findByIdAndUpdate(assistantMessageId, {
              content: fullText,
            }).catch(() => {})
            lastSavedLength = fullText.length
          }
        }
      },
      onEnd: async () => {
        if (assistantMessageId && fullText.trim()) {
          await Message.findByIdAndUpdate(assistantMessageId, {
            content: fullText,
          })
        }
      },
    })

    const uiStream = toUIMessageStream({ stream: result.stream })
    const reader = uiStream.getReader()

    const combined = new ReadableStream({
      start(controller) {
        controllerRef = controller
        while (statusQueue.length > 0) {
          const status = statusQueue.shift()!
          controller.enqueue({
            type: "data-agent-status",
            data: { status },
            transient: true,
          })
        }
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controllerRef = null
              controller.close()
              return
            }
            controller.enqueue(value)
            pump()
          }, (err) => {
            controllerRef = null
            controller.error(err)
          })
        }
        pump()
      },
    })

    return createUIMessageStreamResponse({ stream: combined })
  } catch (error) {
    console.error("Error processing request:", error)
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
