import { z } from "zod"
import { Document, Types } from "mongoose"
import { ZodObjectId } from "./chat.schema"

export const InstructionSchema = z.object({
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

export type TInstructionWithoutDoc = z.infer<typeof InstructionSchema>
export type TInstruction = z.infer<typeof InstructionSchema> &
  Document & {
    _id: Types.ObjectId
    createdAt: Date
    updatedAt: Date
  }
