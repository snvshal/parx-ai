import { getChats } from "@/app/actions/chat"
import { getSessionUser } from "@/app/actions/session-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Suspense } from "react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatListSidebarSkeleton } from "@/components/chat/components"

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
            {chats.map((chat) => (
              <Link
                key={chat.chatId}
                href={`/m/${chat.persona.username}`}
                className="flex h-14 items-center gap-3 rounded-full p-2 hover:bg-accent md:w-72 md:rounded-lg"
              >
                <Avatar>
                  <AvatarImage
                    src={chat.persona.avatar}
                    alt={chat.persona.name}
                  />
                  <AvatarFallback>
                    {chat.persona.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left max-md:hidden">
                  <span className="font-medium">{chat.persona.name}</span>
                  <span className="line-clamp-1 text-sm text-muted-foreground">
                    {chat.lastMessageContent}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
