import { Document, Types } from "mongoose"
import { z } from "zod"

export const ZodObjectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  })
  .transform((val) => new Types.ObjectId(val))

export const ChatSchema = z.object({
  userId: ZodObjectId,
  personaId: ZodObjectId,

  lastMessage: ZodObjectId.optional(),
  unreadCount: z.number().default(0),

  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isMuted: z.boolean().default(false),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type TChat = z.infer<typeof ChatSchema> & Document
