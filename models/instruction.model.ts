import { TInstruction } from "@/schemas/instruction.schema"
import { Schema, Model, model, models } from "mongoose"

const InstructionSchema = new Schema<TInstruction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    mediaUrls: [
      {
        url: { type: String, required: true, minlength: 8, trim: true },
        alt: { type: String, required: true, minlength: 20, trim: true },
      },
    ],
    links: [
      {
        url: { type: String, required: true, minlength: 8, trim: true },
        alt: { type: String, required: true, minlength: 20, trim: true },
      },
    ],
  },
  { timestamps: true },
)

export const Instruction: Model<TInstruction> =
  models.Instruction || model<TInstruction>("Instruction", InstructionSchema)
