import { z } from "zod"
import { ZodObjectId } from "./chat.schema"

// Message Schema
export const MessageSchema = z.object({
  _id: ZodObjectId,

  chatId: ZodObjectId, // link to the chat (persona conversation)
  userId: ZodObjectId, // owner of this inbox/chat
  personaId: ZodObjectId, // the other participant

  role: z.enum(["system", "user", "assistant", "data"]), // who sent it
  type: z.enum(["text", "image", "video", "audio", "file", "system"]), // kind of content

  content: z.string().min(1), // text body
  mediaUrl: z.string().url().optional(), // file / media link
  metadata: z.record(z.any()).optional(), // extra info (e.g., file size, tokens, citations)
  feedback: z.enum(["like", "dislike"]).optional(),

  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type TMessage = z.infer<typeof MessageSchema> & Document
