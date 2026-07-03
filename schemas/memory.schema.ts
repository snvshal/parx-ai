import { z } from "zod"
import { ZodObjectId } from "./chat.schema"
import { MDoc } from "@/types/helper.type"

export const MemoryZodSchema = z.object({
  chatId: ZodObjectId,
  personaId: ZodObjectId,
  role: z.enum(["system", "user"]).default("system"),
  content: z
    .string()
    .trim()
    .min(1, { message: "Memory content is required." }),
})

export type TPMemory = z.infer<typeof MemoryZodSchema>
export type TMemory = TPMemory & MDoc
