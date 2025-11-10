import { SearchIcon, UsersIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getChats } from "@/app/actions/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { AboutNavItems } from "./about/nav-items"
import LinkLoadingIndicator from "./ui/link-loading-indicator"

export async function AppSidebar() {
  const chats = await getChats()
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
              {chats.length === 0 ? (
                <p className="text-muted-foreground p-2 text-sm">
                  No chats found
                </p>
              ) : (
                <>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.persona.name}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/m/${chat.persona.username}`}
                          className="h-10"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={chat.persona.avatar}
                              alt={chat.persona.name}
                            />
                            <AvatarFallback>
                              {chat.persona.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">
                            {chat.persona.name}
                          </span>
                          <LinkLoadingIndicator />
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="h-[calc(100%-12px)]">
                        {chat.unreadCount}
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
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
