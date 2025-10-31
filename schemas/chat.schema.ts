import { MDoc } from "@/types/helper.type"
import { Types } from "mongoose"
import { z } from "zod"

export const ZodObjectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  })
  .transform((val) => new Types.ObjectId(val))

export const ChatZodSchema = z.object({
  userId: ZodObjectId,
  personaId: ZodObjectId,
  lastMessage: ZodObjectId.optional(),
  unreadCount: z.number().default(0),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isMuted: z.boolean().default(false),
})

export type TPChat = z.infer<typeof ChatZodSchema>
export type TChat = TPChat & MDoc
