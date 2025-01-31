"use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Download } from "lucide-react"

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
    <main className="flex min-h-screen items-center justify-center">
      <div className="absolute top-4 right-4 z-20 flex gap-2 items-center justify-center">
        {/* {deferredPrompt && (
          <Button variant="outline" size="icon" onClick={handleInstall}>
            <Download className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )} */}
        {/* <ModeToggle /> */}
      </div>
      <div className="w-full max-w-3xl mx-auto sm:px-4">
        <Chat />
      </div>
    </main>
  )
}
