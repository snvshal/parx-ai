import { model, models, Schema } from "mongoose"
import { TInstruction, TUser } from "@/schemas/user.schema"

const instructionSchema = new Schema<TInstruction>(
  {
    type: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    images: [
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
  { timestamps: true }
)

const UserSchema = new Schema<TUser>(
  {
    username: {
      type: String,
      minlength: 2,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      minlength: 2,
      maxlength: 20,
      required: true,
      trim: true,
    },
    avatar: { type: String, trim: true },
    socialLink: { type: String, trim: true },
    firstMessage: {
      type: String,
      required: true,
      minlength: 80,
      trim: true,
    },
    instructions: { type: [instructionSchema], default: [] },
  },
  {
    timestamps: true,
  }
)

export const User = models.User || model<TUser>("User", UserSchema)
