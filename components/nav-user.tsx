"use client"

import {
  BookAIcon,
  ChevronsUpDown,
  DownloadIcon,
  InfoIcon,
  Settings2Icon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { useSessionUser } from "@/hooks/use-session-user"
import Link from "next/link"
import { usePWA } from "@/hooks/use-pwa"

export function NavUser() {
  const user = useSessionUser()
  const { isMobile } = useSidebar()
  const { isAppInstalled, handleAppInstall } = usePWA()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user?.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <Link href="/settings/profile">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </Link>

        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        {isAppInstalled && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAppInstall}>
                <DownloadIcon />
                Install App
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <Link href="/settings/general">
            <DropdownMenuItem>
              <Settings2Icon />
              Settings
            </DropdownMenuItem>
          </Link>
          <Link href="/settings/instructions">
            <DropdownMenuItem>
              <BookAIcon />
              Instructions
            </DropdownMenuItem>
          </Link>
          {/* <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/about/information">
          <DropdownMenuItem>
            <InfoIcon />
            About
          </DropdownMenuItem>
        </Link>
        {/* <DropdownMenuItem>
          <LogOut />
          Log out
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
