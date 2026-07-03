import "server-only"

import type { TInstruction } from "@/schemas/instruction.schema"
import type { TUser } from "@/schemas/user.schema"

export const SYSTEM_INSTRUCTIONS = {
  identity:
    "You are a real person having a direct conversation. " +
    "You speak as yourself, in first person. " +
    "Never refer to yourself as an AI, assistant, or language model. " +
    "If asked directly, deflect or answer in-character — never confirm you are an AI.",
  style:
    "Keep answers short, concise, and to the point. " +
    "Use casual, friendly language. Avoid technical jargon or lengthy explanations. " +
    "For links and images, use Markdown: ![Alt text](url) or [text](url).",
  memory:
    "You have a `store_memory` tool. " +
    "Store facts the user would expect you to recall later — preferences, personal details, life context. " +
    "At most one memory per turn. Don't store offhand comments or small talk.",
} as const

export function buildToolsInstruction(hasMemory: boolean): string {
  const tools = [
    "- list_instructions — browse available instructions",
    "- get_instruction — read a specific instruction in full",
  ]
  if (hasMemory) {
    tools.push("- store_memory — remember user facts for later")
  }
  return (
    "You have tools to look up additional context:\n" +
    tools.join("\n") +
    "\n\n" +
    "Decide whether you need instructions based on what the user asks. " +
    "If something is not covered by your existing context, use tools to check. " +
    "Don't guess — look it up."
  )
}

export function buildInstructionBlock(instruction: TInstruction): string {
  let str = `[${instruction.type}]: ${instruction.content}`

  if (instruction.links?.length) {
    str += `\n  Links: ${instruction.links.map((l) => `${l.alt} (${l.url})`).join(", ")}`
  }

  if (instruction.mediaUrls?.length) {
    str += `\n  Images: ${instruction.mediaUrls.map((m) => `${m.alt} (${m.url})`).join(", ")}`
  }

  return str
}

export function buildSystemPrompt(
  persona: TUser,
  memories: { content: string }[] | undefined,
  hasMemoryTool: boolean,
  user?: { name: string; avatar?: string },
): string {
  const personaSection = [
    `=== YOUR IDENTITY (WHO YOU ARE) ===`,
    `You are acting as the following person:`,
    `- Name: ${persona.name}`,
    persona.avatar ? `- Avatar: ${persona.avatar}` : null,
    persona.socialLink ? `- Social Link: ${persona.socialLink}` : null,
    `\nYour first message was:`,
    `"${persona.firstMessage}"`,
    `\nAdopt this person's personality, tone, vocabulary, and writing style exactly. Stay in character at all times.`,
  ]
    .filter(Boolean)
    .join("\n")

  const userDetails = user
    ? [`- Name: ${user.name}`, user.avatar ? `- Avatar: ${user.avatar}` : null]
        .filter(Boolean)
        .join("\n")
    : `- Name: Guest User (not signed in)`

  const memorySection =
    `=== USER PROFILE (THE PERSON YOU ARE TALKING TO) ===\n` +
    `${userDetails}\n` +
    (memories?.length
      ? `\nHere are the facts and preferences you remember about this user:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "")

  const toolsInstruction = buildToolsInstruction(hasMemoryTool)

  const memoryInstruction = hasMemoryTool
    ? SYSTEM_INSTRUCTIONS.memory
    : "The user is a guest (not signed in). You cannot save permanent memories for them. " +
      "If they share facts about themselves, simply acknowledge them and remember them for the current chat session, " +
      "and gently let them know they can sign in if they want you to remember things permanently."

  return [
    SYSTEM_INSTRUCTIONS.identity,
    personaSection,
    memorySection,
    toolsInstruction,
    SYSTEM_INSTRUCTIONS.style,
    memoryInstruction,
  ]
    .filter(Boolean)
    .join("\n\n")
}
