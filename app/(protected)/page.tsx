import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSessionUser } from "@/app/actions/session-user"
import { Suspense } from "react"
import Chat from "@/components/chat"
import { getMessages, getUserByUsername } from "@/app/actions/chat"
import { ChatBoxSkeleton } from "@/components/chat/components"
import { TUser } from "@/schemas/user.schema"
import { notFound } from "next/navigation"
import { ps } from "@/lib/utils"
import { ContextPersona, PersonaProvider } from "@/hooks/use-current-persona"

async function ChatBox({ username }: { username: string }) {
  const persona: TUser | null = await getUserByUsername(username)
  if (!persona) notFound()
  const msgs = await getMessages(String(persona._id))

  const initialPersona = {
    id: String(persona._id),
    name: persona.name,
    username: persona.username,
    avatar: persona.avatar,
  } as ContextPersona

  return (
    <PersonaProvider initialPersona={ps(initialPersona)}>
      <Chat msgs={ps(msgs)} />
    </PersonaProvider>
  )
}

export default async function ChatLayout() {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    return (
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        <Suspense fallback={<ChatBoxSkeleton />}>
          <ChatBox username={"snvshal"} />
        </Suspense>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        <Suspense fallback={<ChatBoxSkeleton />}>
          <ChatBox username={sessionUser.username} />
        </Suspense>
      </main>
    </SidebarProvider>
  )
}
