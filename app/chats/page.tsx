import { Suspense } from "react"
import { getChats } from "@/app/actions/chat"
import { HeaderComponent } from "@/components/header"
import { ChatListSkeleton } from "@/components/co"
import { Badge } from "@/components/ui/badge"
import { cacheTag } from "next/cache"
import ChatList from "@/components/chat-list"

export default async function ChatListPage() {
  // "use cache: private"
  // cacheTag("chat-list")
  const chats = await getChats()

  return (
    <HeaderComponent
      page="Chats"
      actionItem={
        <Suspense
          fallback={
            <Badge variant="outline" className="px-4 py-1">
              ...
            </Badge>
          }
        >
          <Badge variant="outline" className="px-4 py-1">
            {chats.length}
          </Badge>
        </Suspense>
      }
      className="pt-0 max-sm:p-0"
    >
      <Suspense fallback={<ChatListSkeleton count={4} />}>
        <ChatList chats={chats} />
      </Suspense>
    </HeaderComponent>
  )
}
