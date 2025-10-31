import { z } from "zod"
import { MDoc, Simplify } from "@/types/helper.type"

export const UserZodSchema = z.object({
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
})

export type TPUser = z.infer<typeof UserZodSchema>
export type TUser = Simplify<TPUser & MDoc>
