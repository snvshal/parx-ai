import { getChats } from "@/app/actions/chat"
import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { ChatList } from "@/components/show/chat-list"

export default async function ChatListPage() {
  const chats = await getChats()

  return (
    <HeaderComponent
      page="Chats"
      actionItem={
        <Badge variant="outline" className="px-4 py-1">
          {chats.length}
        </Badge>
      }
    >
      <ChatList />
    </HeaderComponent>
  )
}
