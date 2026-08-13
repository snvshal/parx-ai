"use client"

import Image from "next/image"
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
import { useChatList } from "@/hooks/use-chat-list"

export function ChatSidebar() {
  const { list: chats } = useChatList()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground mt-2 mb-4 gap-2 text-lg font-semibold">
            <Image
              src="/icons/icon-192x192.png"
              alt="Parx AI logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
            Parx AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="text-normal text-foreground">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
                  <Link href="/people">
                    <UsersIcon />
                    <span>People</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
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
              <SidebarChatList chats={chats} />
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
