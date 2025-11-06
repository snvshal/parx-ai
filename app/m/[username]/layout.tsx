import { getChats, getUserByUsername } from "@/app/actions/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatList } from "@/components/chat/components"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { cn } from "@/lib/utils"
import { User } from "@/models/user.model"
import connectToDatabase from "@/lib/db"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const username = (await params).username
  const user = await getUserByUsername(username)
  if (!user) return { title: "Persona not found" }
  const { name, firstMessage } = user

  return {
    title: `${name} (@${username})`,
    description: firstMessage,
  }
}

export async function generateStaticParams() {
  await connectToDatabase()
  const users = await User.find({}, "username").lean()

  return users.map((user) => ({
    username: user.username,
  }))
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  const user = session?.user
  return (
    <main className="chat-container relative flex h-screen items-center justify-center">
      <div className="flex w-full max-w-full">
        {/* <Suspense fallback={<ChatListSidebarSkeleton />}> */}
        {user && <ChatListSidebar />}
        {/* </Suspense> */}
        <div
          className={cn(
            "mx-auto flex flex-1 items-center lg:px-4",
            !user && "sm:px-4",
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

async function ChatListSidebar() {
  const chats = await getChats()
  return (
    <aside className="w-80 border-r bg-background p-4 max-md:w-auto max-sm:hidden">
      <h2 className="mb-4 h-8 text-lg font-semibold">Chats</h2>
      <ScrollArea className="h-[calc(100dvh-5rem)]">
        {chats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chats found</p>
        ) : (
          <div className="space-y-2">
            <ChatList chats={chats} />
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
