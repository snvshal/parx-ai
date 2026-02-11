import { getServerSession, Session } from "next-auth"
import SessionProviderComponent from "@/components/session-provider"
import { SessionUserProvider } from "@/hooks/use-session-user"
import { getContextUser } from "../actions/session-user"
import { ChatListProvider } from "@/hooks/use-chat-list"
import { getChats } from "../actions/chat"

export const dynamic = "force-dynamic"

export default async function ProtectedLayout({
  children,
  settingsmodal,
  peoplemodal,
  chatsmodal,
}: {
  children: React.ReactNode
  settingsmodal: React.ReactNode
  peoplemodal: React.ReactNode
  chatsmodal: React.ReactNode
}) {
  const chats = await getChats()
  const contextUser = await getContextUser()
  const session: Session | null = await getServerSession()

  return (
    <SessionProviderComponent session={session}>
      <SessionUserProvider initialUser={contextUser}>
        <ChatListProvider chatList={chats}>
          {children}
          {settingsmodal}
          {peoplemodal}
          {chatsmodal}
        </ChatListProvider>
      </SessionUserProvider>
    </SessionProviderComponent>
  )
}
