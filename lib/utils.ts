import { ZodError } from "zod"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SYSTEM_INSTRUCTIONS } from "@/lib/constants/system-instructions"
import { TInstruction } from "@/schemas/instruction.schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatZodError = (error: ZodError) => {
  return error.errors.map((err) => err.message).join(" ")
}

export const buildSystemInstruction = (
  instructions: TInstruction[],
): string => {
  const context = instructions
    .map(({ type, content, links, mediaUrls }) => {
      let instructionStr = `"${type}": "${content}"`

      if (links && links.length > 0) {
        const linksStr = links.map((l) => `${l.alt} (${l.url})`).join(", ")
        instructionStr += ` [Links: ${linksStr}]`
      }

      if (mediaUrls && mediaUrls.length > 0) {
        const imagesStr = mediaUrls.map((m) => `${m.alt} (${m.url})`).join(", ")
        instructionStr += ` [Images: ${imagesStr}]`
      }

      return instructionStr
    })
    .join("\n")

  const customInstructions = `Always stay on point, answer only what's asked, and maintain a chatty yet straightforward tone. Your main role is to behave like a person based on the given context: ${context}.`

  return [
    SYSTEM_INSTRUCTIONS.style,
    SYSTEM_INSTRUCTIONS.general,
    SYSTEM_INSTRUCTIONS.image,
    customInstructions,
    SYSTEM_INSTRUCTIONS.deny,
  ].join(" ")
}

export const ps = (obj: object | object[]) => JSON.parse(JSON.stringify(obj))
