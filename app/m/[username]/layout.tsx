import { getChats } from "@/app/actions/chat"
import { getSessionUser } from "@/app/actions/session-user"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatList, ChatListSidebarSkeleton } from "@/components/chat/components"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="chat-container relative flex h-screen items-center justify-center">
      <div className="flex w-full max-w-full">
        <Suspense fallback={<ChatListSidebarSkeleton />}>
          <ChatListSidebar />
        </Suspense>
        <div className="mx-auto flex flex-1 items-center lg:px-4">
          {children}
        </div>
      </div>
    </main>
  )
}

async function ChatListSidebar() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

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
