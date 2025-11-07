import { Suspense } from "react"
import { ChatSession, getChats } from "@/app/actions/chat"
import { HeaderComponent } from "@/components/header"
import { ChatListSkeleton, Skeleton } from "@/components/co"
import { Badge } from "@/components/ui/badge"
import ChatList from "@/components/chat-list"

async function Chats({
  chatsPromise,
}: {
  chatsPromise: Promise<ChatSession[]>
}) {
  const chats = await chatsPromise
  return <ChatList chats={chats} />
}

export default async function ChatListPage() {
  const chatsPromise = getChats()

  return (
    <HeaderComponent
      page="Chats"
      actionItem={
        <Suspense
          fallback={
            <Badge variant="outline" className="px-4 py-1">
              <Skeleton className="h-full w-full" />
            </Badge>
          }
        >
          <Badge variant="outline" className="px-4 py-1">
            {(await chatsPromise).length}
          </Badge>
        </Suspense>
      }
      className="pt-0 max-sm:p-0"
    >
      <Suspense fallback={<ChatListSkeleton count={4} />}>
        <Chats chatsPromise={chatsPromise} />
      </Suspense>
    </HeaderComponent>
  )
}
