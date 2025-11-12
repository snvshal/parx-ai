"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useChatList } from "@/hooks/use-chat-list"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import LinkLoadingIndicator from "./ui/link-loading-indicator"
import { useSessionUser } from "@/hooks/use-session-user"
import { useParams } from "next/navigation"

export default function ChatList() {
  const { list: chats } = useChatList()
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
        <div className="bg-background sticky top-0 z-20 py-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="bg-background w-full rounded-lg border px-4 py-2 text-sm"
          />
        </div>
      )}
      <ScrollArea className="h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-12rem)]">
        {filtered.map((chat, index) => (
          <Link key={index} href={`/m/${chat.personaId.username}`}>
            <Card className="group relative rounded-none border-0 border-b transition-all">
              <div className="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 z-10 transition-colors duration-300" />
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={chat.personaId.avatar}
                      alt={chat.personaId.name}
                    />
                    <AvatarFallback>
                      {chat.personaId.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{chat.personaId.name}</p>
                    <p className="text-muted-foreground text-sm">
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
                    className="rounded-full px-3 py-1.5 font-medium"
                  >
                    {chat.unreadCount}
                  </Badge>
                ) : null}
              </CardHeader>
            </Card>
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
      </ScrollArea>
    </div>
  )
}

export function ChatListCount() {
  const { list: chats } = useChatList()

  return (
    <Badge variant="outline" className="px-4 py-2">
      {chats.length} Chats
    </Badge>
  )
}

export function ChatListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="container mx-auto">
      <div className="bg-background sticky top-0 z-20 py-4">
        <Input
          placeholder="Search chats..."
          className="bg-background w-full rounded-lg border px-4 py-2 text-sm"
          disabled
        />
      </div>
      <div className="flex flex-col">
        {[...Array(count)].map((_, i) => (
          <Card key={i} className="rounded-none border-0 border-b p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SidebarChatList() {
  const user = useSessionUser()
  const { username } = useParams()
  const { list: chats } = useChatList()

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
          <SidebarMenuBadge className="h-[calc(100%-12px)]">
            {chat.unreadCount ? chat.unreadCount : null}
          </SidebarMenuBadge>
        </SidebarMenuItem>
      ))}
    </>
  )
}
