import { Model, model, models, Schema } from "mongoose"
import { TUser } from "@/schemas/user.schema"

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
      minlength: 40,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const User: Model<TUser> =
  models.User || model<TUser>("User", UserSchema)
