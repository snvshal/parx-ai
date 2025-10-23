"use client"

import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { DownloadIcon } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler as EventListener)

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      )
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)

    setInstallPrompt(null)
    setIsVisible(false)
  }

  return (
    <>
      {isVisible && (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleInstallClick}
        >
          <DownloadIcon className="h-5 w-5 text-foreground/80" />
        </Button>
      )}
    </>
  )
}
