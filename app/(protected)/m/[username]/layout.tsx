import { Metadata } from "next"
import { getUserByUsername } from "@/app/actions/chat"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/app-sidebar"

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
  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        {children}
      </main>
    </SidebarProvider>
  )
}
