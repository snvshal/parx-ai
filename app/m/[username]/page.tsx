import { Chat } from "@/components/chat/component"
import { getMessages, getUserByUsername } from "@/app/actions/chat"
import { TUser } from "@/schemas/user.schema"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"

export default async function Username({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = (await params).username

  const persona: TUser | null = await getUserByUsername(username)
  if (!persona) notFound()

  const msgs = await getMessages(persona._id?.toString() as string)

  return (
    <main className="flex min-h-[100dvh] items-center justify-center">
      <div className="mx-auto w-full max-w-3xl sm:px-4">
        <Chat
          persona={JSON.parse(JSON.stringify(persona))}
          msgs={JSON.parse(JSON.stringify(msgs))}
        />
      </div>
    </main>
  )
}
