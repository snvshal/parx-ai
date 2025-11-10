"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsAppInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", handler as EventListener)

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      )
  }, [])

  const handleAppInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)

    setInstallPrompt(null)
    setIsAppInstalled(false)
  }
  return { isAppInstalled, handleAppInstall }
}
