import { ZodError } from "zod"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatZodError = (error: ZodError) => {
  return error.errors.map((err) => err.message).join(" ")
}

export const ps = (obj: object | object[]) => JSON.parse(JSON.stringify(obj))
