import { getMessages, getUserByUsername } from "@/app/actions/chat"
import Chat from "@/components/chat"
import { TUser } from "@/schemas/user.schema"
import { notFound } from "next/navigation"

export default async function Username({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = (await params).username

  const persona: TUser | null = await getUserByUsername(username)
  if (!persona) notFound()

  const msgs = await getMessages(String(persona._id))

  return (
    <Chat
      persona={JSON.parse(JSON.stringify(persona))}
      msgs={JSON.parse(JSON.stringify(msgs))}
    />
  )
}
