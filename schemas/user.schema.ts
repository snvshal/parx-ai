import { z } from "zod"
import { Document } from "mongoose"

export const UserSchema = z.object({
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
    .min(40, { message: "First Message must be at least 40 characters long." }),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type TUser = z.infer<typeof UserSchema> & Document
export type TUserWithoutDoc = z.infer<typeof UserSchema>
// export type TUser = Omit<z.infer<typeof UserSchema>, "instructions"> &
//   Document
