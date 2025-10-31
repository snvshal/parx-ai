export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getChats } from "@/app/actions/chat"
import { HeaderComponent } from "@/components/header"
import { ChatSession } from "@/app/actions/chat"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChatListSkeleton } from "@/components/co"

export default async function ChatListPage() {
  const chatsPromise = getChats()

  return (
    <HeaderComponent
      page="Chats"
      actionItem={
        <Suspense
          fallback={
            <Badge variant="outline" className="px-4 py-1">
              ...
            </Badge>
          }
        >
          <ChatCount chatsPromise={chatsPromise} />
        </Suspense>
      }
      className="max-sm:p-0"
    >
      <Suspense fallback={<ChatListSkeleton count={4} />}>
        <ChatList chatsPromise={chatsPromise} />
      </Suspense>
    </HeaderComponent>
  )
}

async function ChatCount({
  chatsPromise,
}: {
  chatsPromise: Promise<ChatSession[]>
}) {
  const chats = await chatsPromise
  return (
    <Badge variant="outline" className="px-4 py-1">
      {chats.length}
    </Badge>
  )
}

async function ChatList({
  chatsPromise,
}: {
  chatsPromise: Promise<ChatSession[]>
}) {
  const chats = await chatsPromise

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:gap-4 sm:p-4">
        {chats.map((chat) => (
          <Link key={chat.chatId} href={`/m/${chat.persona.username}`}>
            <Card className="group relative rounded-3xl transition-all max-sm:rounded-none max-sm:border-0 max-sm:border-b sm:hover:shadow-[0_0_10px_#3b82f6]">
              <div className="absolute inset-0 z-10 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10 sm:hidden" />
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
                    <p className="text-sm text-muted-foreground">
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
                    {chat.unreadCount > 0 ? chat.unreadCount : "0"}
                  </Badge>
                ) : null}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
