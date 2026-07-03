import { TMemory } from "@/schemas/memory.schema"
import { Schema, Model, model, models } from "mongoose"

const MemorySchema = new Schema<TMemory>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    personaId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["system", "user"],
      default: "system",
    },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

MemorySchema.index({ chatId: 1, createdAt: -1 })

export const Memory: Model<TMemory> =
  models.Memory || model<TMemory>("Memory", MemorySchema)
