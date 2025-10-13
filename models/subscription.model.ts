import { TSubscription } from "@/schemas/subscription.schema"
import { Schema, model, models, Model } from "mongoose"

const SubscriptionSchema = new Schema<TSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true },
)

SubscriptionSchema.index({ userId: 1 }, { unique: true })

export const Subscription: Model<TSubscription> =
  models.Subscription ||
  model<TSubscription>("Subscription", SubscriptionSchema)
