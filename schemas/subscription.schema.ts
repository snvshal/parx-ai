import { z } from "zod"
import { ZodObjectId } from "./chat.schema"

export const SubscriptionSchema = z.object({
  userId: ZodObjectId,
  endpoint: z.string().url("Invalid endpoint URL"),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export type TSubscription = z.infer<typeof SubscriptionSchema>
