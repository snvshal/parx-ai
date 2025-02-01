"use client"

import { Chat } from "@/components/chat"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-3xl mx-auto sm:px-4">
        <Chat />
      </div>
    </main>
  )
}
