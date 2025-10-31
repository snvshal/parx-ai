import { z } from "zod"
import { ZodObjectId } from "./chat.schema"
import { MDoc } from "@/types/helper.type"

export const InstructionZodSchema = z.object({
  userId: ZodObjectId,
  type: z.string().trim().min(1, { message: "Instruction type is required." }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Instruction content is required." }),
  mediaUrls: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(8, { message: "Image URL must be at least 8 characters long." }),
        alt: z.string().trim().min(20, {
          message: "Image ALT text must be at least 20 characters long.",
        }),
      }),
    )
    .default([]),
  links: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(8, { message: "Link URL must be at least 8 characters long." }),
        alt: z.string().trim().min(20, {
          message: "Link ALT text must be at least 20 characters long.",
        }),
      }),
    )
    .default([]),
})

export type TPInstruction = z.infer<typeof InstructionZodSchema>
export type TInstruction = TPInstruction & MDoc
