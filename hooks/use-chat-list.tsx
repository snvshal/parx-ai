"use client"

import { PopulatedChat } from "@/app/actions/chat"
import { createContext, useContext, useState } from "react"

type ChatContextType = {
  list: PopulatedChat[]
  setList: React.Dispatch<React.SetStateAction<PopulatedChat[]>>
}

const ChatListContext = createContext<ChatContextType | undefined>(undefined)

export function ChatListProvider({
  children,
  chatList = [],
}: {
  children: React.ReactNode
  chatList: PopulatedChat[]
}) {
  const [list, setList] = useState<PopulatedChat[]>(chatList)

  return (
    <ChatListContext.Provider value={{ list, setList }}>
      {children}
    </ChatListContext.Provider>
  )
}

export function useChatList() {
  const context = useContext(ChatListContext)
  if (!context)
    throw new Error("useChatList must be used within a ChatProvider")
  return context
}
