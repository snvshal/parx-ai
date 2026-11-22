"use client"

import Image from "next/image"
import { DownloadIcon, InfoIcon, SearchIcon, Settings2Icon, UsersIcon } from "lucide-react"
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
import { useSessionUser } from "@/hooks/use-session-user"
import { Button } from "./ui/button"
import { useState } from "react"
import { GuestSettingsDialog } from "./settings/guest-dialog"
import { usePWA } from "@/hooks/use-pwa"

export function ChatSidebar() {
  const user = useSessionUser()
  const { list: chats } = useChatList()
  const [openSettings, setOpenSettings] = useState(false)
  const { isAppInstalled, handleAppInstall } = usePWA()

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
              {user ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-10">
                    <Link href="/chats">
                      <SearchIcon />
                      <span>Search Chats</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-10">
                      <Link href="/about/how-to-use">
                        <InfoIcon />
                        <span>About</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setOpenSettings(true)}
                      className="h-10 cursor-pointer"
                    >
                      <Settings2Icon />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAppInstalled && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleAppInstall}
                        className="h-10 cursor-pointer"
                      >
                        <DownloadIcon />
                        <span>Install App</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarChatList chats={chats} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <NavUser />
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <div className="p-3">
            <Link href="/sign-in" className="block w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full rounded-full"
              >
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </SidebarFooter>
      <GuestSettingsDialog
        open={openSettings}
        setOpen={setOpenSettings}
      />
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
