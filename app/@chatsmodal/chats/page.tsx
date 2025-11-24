import ChatList from "@/components/chat-list"
import { SettingsHeader } from "@/components/header"

export default async function ChatListPage() {
  return (
    <SettingsHeader page="Chats">
      <ChatList />
    </SettingsHeader>
  )
}
