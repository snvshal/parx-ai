import { Chat } from "@/components/chat"
import { ModeToggle } from "@/components/ui/theme-provider"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-4xl mx-auto px-4">
        <Chat />
      </div>
    </main>
  )
}
