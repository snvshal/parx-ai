import { z } from "zod"
import { ZodObjectId } from "./chat.schema"
import { MDoc } from "@/types/helper.type"

export const SubscriptionZodSchema = z.object({
  userId: ZodObjectId,
  endpoint: z.string().url("Invalid endpoint URL"),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export type TPSubscription = z.infer<typeof SubscriptionZodSchema>
export type TSubscription = TPSubscription & MDoc
