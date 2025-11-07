import { z } from "zod"
import { ZodObjectId } from "./chat.schema"
import { MDoc } from "@/types/helper.type"

export const MessageZodSchema = z.object({
  chatId: ZodObjectId,
  userId: ZodObjectId,
  personaId: ZodObjectId,
  role: z.enum(["system", "user", "assistant"]),
  type: z.enum(["text", "image", "video", "audio", "file", "system"]),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  feedback: z.enum(["like", "dislike"]).optional(),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
})

export type TPMessage = z.infer<typeof MessageZodSchema>
export type TMessage = TPMessage & MDoc
