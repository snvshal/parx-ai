import { TChat } from "@/schemas/chat.schema"
import { Schema, Model, model, models } from "mongoose"

const ChatSchema = new Schema<TChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personaId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    unreadCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

ChatSchema.index({ userId: 1, personaId: 1 }, { unique: true })
ChatSchema.index({ userId: 1, updatedAt: -1 })

export const Chat: Model<TChat> =
  models.Chat || model<TChat>("Chat", ChatSchema)
