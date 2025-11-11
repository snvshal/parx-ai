"use client"

import { useMemo, useState } from "react"
import { ChatSession } from "@/app/actions/chat"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

export default function ChatList({ chats }: { chats: ChatSession[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return chats
    return chats.filter(
      (chat) =>
        chat.persona.name.toLowerCase().includes(lower) ||
        chat.persona.username.toLowerCase().includes(lower) ||
        chat.lastMessageContent?.toLowerCase().includes(lower),
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
        {filtered.map((chat) => (
          <Link key={chat.chatId} href={`/m/${chat.persona.username}`}>
            <Card className="group relative rounded-none border-0 border-b transition-all">
              <div className="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 z-10 transition-colors duration-300" />
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={chat.persona.avatar}
                      alt={chat.persona.name}
                    />
                    <AvatarFallback>
                      {chat.persona.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{chat.persona.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {chat.lastMessageContent
                        ? chat.lastMessageContent.length > 40
                          ? chat.lastMessageContent.substring(0, 40) + "..."
                          : chat.lastMessageContent
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
