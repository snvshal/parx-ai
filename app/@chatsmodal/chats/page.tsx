import { HeaderComponent } from "@/components/header"
import ChatList, { ChatListCount } from "@/components/chat-list"

export default async function ChatListPage() {
  return (
    <HeaderComponent
      page="Chats"
      actionItem={<ChatListCount />}
      className="pt-0"
    >
      <ChatList />
    </HeaderComponent>
  )
}
