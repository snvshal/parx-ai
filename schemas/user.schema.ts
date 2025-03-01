import { z } from "zod"
import { Document, Types } from "mongoose"

export const instructionSchema = z.object({
  type: z.string().trim().min(1, { message: "Instruction type is required." }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Instruction content is required." }),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(8, { message: "Image URL must be at least 8 characters long." }),
        alt: z.string().trim().min(20, {
          message: "Image ALT text must be at least 20 characters long.",
        }),
      })
    )
    .default([]),
  links: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(8, { message: "Link URL must be at least 8 characters long." }),
        alt: z.string().trim().min(20, {
          message: "Link ALT text must be at least 20 characters long.",
        }),
      })
    )
    .default([]),
})

export const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, { message: "Username must be at least 2 characters long." })
    .toLowerCase(),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .toLowerCase(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(20, { message: "Name must be less than 20 characters long." }),
  avatar: z.string().trim().optional(),
  socialLink: z.string().trim().optional(),
  firstMessage: z
    .string()
    .trim()
    .min(80, { message: "First Message must be at least 80 characters long." }),
  instructions: z.array(instructionSchema).default([]),
})

export type TInstruction = z.infer<typeof instructionSchema> & {
  _id: Types.ObjectId
}

export type TUser = Omit<z.infer<typeof userSchema>, "instructions"> &
  Document & {
    instructions: TInstruction[]
  }
