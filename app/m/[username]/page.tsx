import { Suspense } from "react"
import Chat from "@/components/chat"
import { getMessages, getUserByUsername } from "@/app/actions/chat"
import { ChatBoxSkeleton } from "@/components/chat/components"
import { TUser } from "@/schemas/user.schema"
import { notFound } from "next/navigation"
import { ps } from "@/lib/utils"
import { ContextPersona, PersonaProvider } from "@/hooks/use-current-persona"

async function ChatBox({ params }: { params: Promise<{ username: string }> }) {
  // "use cache: private"
  const username = (await params).username
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

export default async function Username({ params }: PageProps<"/m/[username]">) {
  return (
    <Suspense fallback={<ChatBoxSkeleton />}>
      <ChatBox params={params} />
    </Suspense>
  )
}
