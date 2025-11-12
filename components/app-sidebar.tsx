import { SearchIcon, UsersIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { AboutNavItems } from "./about/nav-items"
import { SidebarChatList } from "./chat-list"

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground mt-2 mb-4 text-lg font-medium">
            Parx AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-normal text-foreground">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/people">
                    <UsersIcon />
                    <span>People</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chats">
                    <SearchIcon />
                    <span>Search Chats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarChatList />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AboutSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground mt-2 mb-4 text-lg font-medium">
            About
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AboutNavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
