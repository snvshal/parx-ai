import "server-only"

import { streamText, isStepCount, convertToModelMessages } from "ai"
import { openrouter, CHAT_MODEL } from "./config"
import { buildSystemPrompt } from "./instructions"
import { getMemories } from "./db/memory"
import { getPersonaById } from "./db/persona"
import { createInstructionTools, createMemoryTool } from "./tools"
import type { AgentStreamOptions } from "./types"

export class Agent {
  constructor(private personaId: string) {}

  async stream(options: AgentStreamOptions) {
    let memories
    if (options.chatId) {
      options.onStatus?.("Searching memory...")
      memories = await getMemories(options.chatId)
    }

    options.onStatus?.("Preparing context...")
    const persona = await getPersonaById(this.personaId)
    if (!persona) throw new Error("Persona not found")

    const systemPrompt = buildSystemPrompt(
      persona,
      memories,
      !!options.chatId,
      options.user,
    )
    const messages = await convertToModelMessages(options.messages)

    options.onStatus?.("Thinking...")

    const tools = {
      ...createInstructionTools(this.personaId, options.onStatus),
      ...(options.chatId
        ? createMemoryTool(
            { chatId: options.chatId, personaId: this.personaId },
            options.onStatus,
          )
        : {}),
    }

    return streamText({
      model: openrouter.chat(CHAT_MODEL),
      instructions: systemPrompt,
      messages,
      tools,
      stopWhen: isStepCount(options.maxSteps ?? 5),
      onChunk: options.onChunk,
      onEnd: options.onEnd,
    })
  }
}
