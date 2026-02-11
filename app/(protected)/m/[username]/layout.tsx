import { Metadata } from "next"
import { getChats, getUserByUsername } from "@/app/actions/chat"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSessionUser } from "@/app/actions/session-user"
import { ChatListProvider } from "@/hooks/use-chat-list"

export async function generateMetadata({
  params,
}: PageProps<"/m/[username]">): Promise<Metadata> {
  const username = (await params).username
  const user = await getUserByUsername(username)
  if (!user) return { title: "Persona not found" }
  const { name, firstMessage } = user

  return {
    title: `${name} (@${username})`,
    description: firstMessage,
  }
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    return (
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        {children}
      </main>
    )
  }

  const chats = await getChats()

  return (
    <ChatListProvider chatList={chats}>
      <SidebarProvider>
        <AppSidebar />
        <main className="chat-container relative flex h-dvh w-full items-center justify-center">
          {children}
        </main>
      </SidebarProvider>
    </ChatListProvider>
  )
}
