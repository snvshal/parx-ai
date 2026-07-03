import "server-only"

import { tool } from "ai"
import { z } from "zod"
import { getInstructionList, getInstructionById } from "./db/instructions"
import { buildInstructionBlock } from "./instructions"
import { addMemory } from "./db/memory"

export function createInstructionTools(
  personaId: string,
  onStatus?: (status: string) => void,
) {
  return {
    list_instructions: tool({
      description:
        "List all instruction titles, IDs, and content previews for this persona. Use this to discover which instructions are available.",
      inputSchema: z.object({}),
      execute: async () => {
        onStatus?.("Listing instructions...")
        try {
          const instructions = await getInstructionList(personaId)
          return instructions.map((inst) => ({
            id: inst._id,
            type: inst.type,
            preview: inst.content.slice(0, 100),
          }))
        } finally {
          onStatus?.("Thinking...")
        }
      },
    }),
    get_instruction: tool({
      description:
        "Get the full content of an instruction by its ID, including any links and images.",
      inputSchema: z.object({
        id: z.string().describe("The ID of the instruction to retrieve"),
      }),
      execute: async ({ id }) => {
        onStatus?.("Reading instruction...")
        try {
          const instruction = await getInstructionById(id)
          if (!instruction) return { error: "Instruction not found" }
          return buildInstructionBlock(instruction)
        } finally {
          onStatus?.("Thinking...")
        }
      },
    }),
  }
}

export function createMemoryTool(
  ctx: {
    chatId: string
    personaId: string
  },
  onStatus?: (status: string) => void,
) {
  return {
    store_memory: tool({
      description:
        "Store something worth remembering about the user — preferences, personal info, key facts, or anything they'd expect you to recall later in the conversation.",
      inputSchema: z.object({
        content: z.string().describe("The memory content to store"),
      }),
      execute: async ({ content }) => {
        onStatus?.("Saving memory...")
        try {
          await addMemory({
            chatId: ctx.chatId,
            personaId: ctx.personaId,
            content,
          })
          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        } finally {
          onStatus?.("Thinking...")
        }
      },
    }),
  }
}
