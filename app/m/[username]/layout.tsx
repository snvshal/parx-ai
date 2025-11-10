import { getUserByUsername } from "@/app/actions/chat"
import { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSessionUser } from "@/app/actions/session-user"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        {children}
      </main>
    </SidebarProvider>
  )
}
