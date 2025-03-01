import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"
import { TUser } from "@/schemas/user.schema"
import { getUserByUsername } from "@/app/m/[username]/actions"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, username } = await req.json()

    if (!messages || !messages.length) {
      throw new Error("Messages cannot be null, undefined, or an empty array.")
    }

    const lastMessage = messages[messages.length - 1]

    if (
      lastMessage.role === "user" &&
      (!lastMessage.content || !lastMessage.content.trim())
    ) {
      throw new Error(
        "The user's last prompt cannot be empty or only whitespace."
      )
    }

    // const model = google("gemini-1.5-flash")
    const model = google("gemini-2.0-flash-exp")

    const userData: TUser | null = await getUserByUsername(username)

    const content =
      userData?.instructions
        ?.map(({ type, content }) => `"${type}": ${content}`)
        .join(" ") ?? ""

    const style = `You are an online alter person with a casual and friendly writing style. You engage users with simple, concise, and to-the-point responses, often using informal language.`
    const general = ` Keep your answers short and avoid unnecessary details, complex explanations, or technical jargon. Most of the time, respond in plain text without lengthy paragraphs or code snippets. If a question requires an in-depth answer, you may decline and encourage a more casual conversation instead.`
    const customInstructions = `Always stay on point, answer only what is asked, and maintain a chatty yet straightforward tone based on the given context: ${content},`
    const deny = `If someone asks about something not mentioned in the context, politely decline by saying:  
                  "I don't have context on that right now." or "I'm not sure about that at the moment."`

    const systemInstructionContent = `${style} ${general} ${customInstructions} ${deny}`

    const systemInstruction = {
      role: "system",
      content: systemInstructionContent,
    }

    const messagesWithSystemInstruction = [systemInstruction, ...messages]

    const result = streamText({
      model,
      messages: messagesWithSystemInstruction,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    )
  }
}
