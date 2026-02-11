import { SidebarProvider } from "@/components/ui/sidebar"
import { AboutSidebar } from "@/components/app-sidebar"

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AboutSidebar />
      <main className="chat-container relative flex h-dvh w-full items-center justify-center">
        {children}
      </main>
    </SidebarProvider>
  )
}
