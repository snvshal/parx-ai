"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import LinkLoadingIndicator from "./ui/link-loading-indicator"
import { useSessionUser } from "@/hooks/use-session-user"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { PopulatedChat } from "@/app/actions/chat"

export default function ChatList({ chats }: { chats: PopulatedChat[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return chats
    return chats.filter(
      (chat) =>
        chat.personaId.name.toLowerCase().includes(lower) ||
        chat.personaId.username.toLowerCase().includes(lower) ||
        chat.lastMessage?.content?.toLowerCase().includes(lower),
    )
  }, [query, chats])

  return (
    <div className="relative">
      {!(chats.length === 0) && (
        <div className="bg-popover sticky top-0 z-20 -mt-6 pt-6 pb-6">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="pl-9"
            />
          </div>
        </div>
      )}
      <div className="divide-border flex flex-col divide-y">
        {filtered.map((chat, index) => (
          <Link
            key={index}
            href={`/m/${chat.personaId.username}`}
            className="hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between gap-4 px-2 py-4">
              <div className="flex min-w-0 gap-4">
                <Avatar>
                  <AvatarImage
                    src={chat.personaId.avatar}
                    alt={chat.personaId.name}
                  />
                  <AvatarFallback>
                    {chat.personaId.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {chat.personaId.name}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {chat.lastMessage?.content
                      ? chat.lastMessage?.content.length > 40
                        ? chat.lastMessage?.content.substring(0, 40) + "..."
                        : chat.lastMessage?.content
                      : "No messages yet"}
                  </p>
                </div>
              </div>
              {chat.unreadCount ? (
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-full px-3 py-1.5 font-medium"
                >
                  {chat.unreadCount}
                </Badge>
              ) : null}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted-foreground space-y-4 py-24 text-center">
            <p>No chats found.</p>
          </div>
        )}
        {chats.length === 0 && (
          <div className="text-muted-foreground space-y-4 py-24 text-center">
            <p>No chats found.</p>
            <Button>
              <Link href="/people">Find People</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatListCount({ chats }: { chats: PopulatedChat[] }) {
  return (
    <Badge variant="outline" className="px-4 py-2">
      {chats.length} Chats
    </Badge>
  )
}

export function ChatListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="relative">
      <div className="bg-popover sticky top-0 z-20 -mt-6 pt-6 pb-6">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input placeholder="Search chats..." className="pl-9" disabled />
        </div>
      </div>
      <div className="divide-border flex flex-col divide-y">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-2 py-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SidebarChatList({ chats }: { chats: PopulatedChat[] }) {
  const user = useSessionUser()
  const { username } = useParams()

  if (chats.length === 0) {
    return <p className="text-muted-foreground p-2 text-sm">No chats found</p>
  }

  return (
    <>
      {chats.map((chat, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={username === chat.personaId.username}
          >
            <Link href={`/m/${chat.personaId.username}`} className="h-10">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={chat.personaId.avatar}
                  alt={chat.personaId.name}
                />
                <AvatarFallback>
                  {chat.personaId.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{chat.personaId.name}</span>
              <span className="text-muted-foreground">
                {user?.username === chat.personaId.username ? "(You)" : null}
              </span>
              <LinkLoadingIndicator />
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge
            className={cn(
              "right-2 mt-1 rounded-full",
              chat.unreadCount && "bg-blue-500",
            )}
          >
            {chat.unreadCount ? chat.unreadCount : null}
          </SidebarMenuBadge>
        </SidebarMenuItem>
      ))}
    </>
  )
}
