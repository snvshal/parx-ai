import { Chat } from "@/components/chat"
import { getUserByUsername } from "./actions"
import { TUser } from "@/schemas/user.schema"
import { notFound } from "next/navigation"

export default async function Username({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = (await params).username

  const user: TUser | null = await getUserByUsername(username)

  if (!user) notFound()

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-3xl mx-auto sm:px-4">
        <Chat user={JSON.parse(JSON.stringify(user))} />
      </div>
    </main>
  )
}
