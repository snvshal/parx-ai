"use client"

import React, { useEffect, useState } from "react"
import { ChatSession, getChats } from "@/app/actions/chat"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HeaderComponent } from "@/components/header"
import Loading from "../loading"

const fetchUserChats = async (): Promise<ChatSession[]> => {
  // Replace with your API call or data fetching logic

  const chats = await getChats()
  return chats
}

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserChats().then((data) => {
      setChats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />

  return (
    <HeaderComponent
      page="Chats"
      actionItem={
        <Badge variant="outline" className="px-4 py-1">
          {chats.length}
        </Badge>
      }
    >
      <ChatList chats={chats} />
    </HeaderComponent>
  )
}

export function ChatList({ chats }: { chats: ChatSession[] }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        {/* <div className="flex items-center justify-between px-4">
          <h1 className="text-xl font-bold md:text-3xl">Chats</h1>
          <Badge variant="outline" className="px-4 py-1">
            {chats.length}
          </Badge>
        </div> */}

        {/* <ScrollArea className="flex-1"> */}
        <div className="flex flex-col gap-4">
          {chats.map((chat) => (
            <Link key={chat.chatId} href={`/m/${chat.persona.username}`}>
              <Card className="transition-shadow hover:shadow-[0_0_10px_#3b82f6]">
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
                      <div className="font-semibold">{chat.persona.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {chat.lastMessageContent
                          ? chat.lastMessageContent.length > 40
                            ? chat.lastMessageContent.substring(0, 40) + "..."
                            : chat.lastMessageContent
                          : "No messages yet"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-2 py-1">
                    {chat.unreadCount > 0 ? chat.unreadCount : "0"}
                  </Badge>
                </CardHeader>
                {/* <CardContent>
                    {person.instructions?.length ? (
                      person.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          <p>{instruction.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No instructions provided.
                      </p>
                    )}
                  </CardContent> */}
              </Card>
            </Link>
          ))}
        </div>
        {/* </ScrollArea> */}
      </div>
    </div>
  )
}
