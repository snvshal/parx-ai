import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/app-sidebar"

export default async function StandalonePeopleLayout({
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
