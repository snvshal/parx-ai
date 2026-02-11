import { getChats } from "@/app/actions/chat"
import ChatList from "@/components/chat-list"
import { SettingsHeader } from "@/components/header"

export default async function ChatListPage() {
  const chats = await getChats()

  return (
    <SettingsHeader page="Chats">
      <ChatList chats={chats} />
    </SettingsHeader>
  )
}
