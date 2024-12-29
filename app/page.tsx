"use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"

import { Chat } from "@/components/chat"
import { ModeToggle } from "@/components/ui/theme-provider"

// interface BeforeInstallPromptEvent extends Event {
//   prompt: () => Promise<void>
//   userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
// }

export default function Home() {
  // const [deferredPrompt, setDeferredPrompt] =
  //   useState<BeforeInstallPromptEvent | null>(null)

  // useEffect(() => {
  //   const handler = (e: Event) => {
  //     e.preventDefault()
  //     setDeferredPrompt(e as BeforeInstallPromptEvent)
  //   }
  //   window.addEventListener("beforeinstallprompt", handler)
  //   return () => window.removeEventListener("beforeinstallprompt", handler)
  // }, [])

  // const handleInstall = async () => {
  //   if (deferredPrompt) {
  //     deferredPrompt.prompt()
  //     const { outcome } = await deferredPrompt.userChoice
  //     if (outcome === "accepted") {
  //       setDeferredPrompt(null)
  //     }
  //   }
  // }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {/* {deferredPrompt && <Button onClick={handleInstall}>Install App</Button>} */}

      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-3xl mx-auto px-4">
        <Chat />
      </div>
    </main>
  )
}
