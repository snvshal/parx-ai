"use server"

import webpush from "web-push"
import type { PushSubscription } from "web-push"
import { Subscription } from "@/models/subscription.model"
import connectToDatabase from "@/lib/db"
import { Types } from "mongoose"

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

// ✅ Subscribe user
export async function subscribeUser(userId: string, sub: PushSubscription) {
  await connectToDatabase()

  // Upsert by both userId and endpoint (keeps multi-device support)
  await Subscription.findOneAndUpdate(
    { userId, endpoint: sub.endpoint },
    {
      userId: new Types.ObjectId(userId),
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    },
    { upsert: true, new: true },
  )

  return { success: true }
}

// ✅ Unsubscribe user
export async function unsubscribeUser(endpoint: string) {
  await connectToDatabase()
  await Subscription.findOneAndDelete({ endpoint })
  return { success: true }
}

// ✅ Send notification to one user
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
) {
  await connectToDatabase()

  const subscriptions = await Subscription.find({ userId })
  if (subscriptions.length === 0) {
    return { success: false, error: "No subscriptions found" }
  }

  const payload = JSON.stringify({
    title: title || "New Notification",
    body: message,
    icon: "/icons/icon-192x192.png",
  })

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload,
        )
      } catch (err: any) {
        console.error("Push send error:", err.statusCode)
        // Remove expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await Subscription.findByIdAndDelete(sub._id)
        }
      }
    }),
  )

  return { success: true }
}

// ✅ Send notification to many users at once
export async function sendNotificationToMany(
  userIds: string[],
  title: string,
  message: string,
) {
  await connectToDatabase()

  const objectIds = userIds.map((id) => new Types.ObjectId(id))
  const subscriptions = await Subscription.find({ userId: { $in: objectIds } })

  if (subscriptions.length === 0) {
    return { success: false, error: "No subscriptions found" }
  }

  const payload = JSON.stringify({
    title: title || "New Notification",
    body: message,
    icon: "/icons/icon-192x192.png",
  })

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload,
        )
      } catch (err: any) {
        console.error("Push send error:", err.statusCode)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await Subscription.findByIdAndDelete(sub._id)
        }
      }
    }),
  )

  return { success: true }
}
