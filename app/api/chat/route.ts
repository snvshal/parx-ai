import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { NextRequest, NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !messages.length) {
      throw new Error("Messages cannot be null, undefined, or an empty array.")
    }

    const model = google("gemini-1.5-flash")

    const result = streamText({
      model,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    )
  }
}
