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
    .map(({ type, content }) => `"${type}": "${content}"`)
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
