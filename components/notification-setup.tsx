"use client"

import { useEffect } from "react"

export default function NotificationSetup() {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  return null
}
