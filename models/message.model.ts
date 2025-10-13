import { TMessage } from "@/schemas/message.schema"
import { Schema, Model, model, models } from "mongoose"

const MessageSchema = new Schema<TMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personaId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    role: {
      type: String,
      enum: ["system", "user", "assistant", "data"],
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      required: true,
    },

    content: { type: String, trim: true },
    mediaUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
    feedback: { type: String, enum: ["like", "dislike"] },

    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

MessageSchema.index({ chatId: 1, createdAt: -1 })
MessageSchema.index({ userId: 1, createdAt: -1 })

export const Message: Model<TMessage> =
  models.Message || model<TMessage>("Message", MessageSchema)
