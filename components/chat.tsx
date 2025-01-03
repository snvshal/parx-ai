"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Bot, SendHorizontal } from "lucide-react"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useState } from "react"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat()

  return (
    <Card className="flex h-[calc(100vh-50px)] w-full rounded-3xl flex-col max-sm:border-0">
      <ScrollArea className="flex-1 p-4 sm:p-8">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {isLoading && (
            <div className={cn("flex w-full items-start gap-4 rounded-lg p-4")}>
              <div className="rounded-full bg-primary p-2">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <ThinkingAnimation text="is thinking" />
            </div>
          )}
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Send a message to start the conversation
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-2 m-4 rounded-full border"
      >
        <Input
          placeholder="Type your message..."
          value={input}
          name="prompt"
          onChange={handleInputChange}
          disabled={isLoading}
          suppressHydrationWarning
          className="flex-1 border-0 outline-none focus-visible:ring-0"
          autoComplete="off"
          // autoFocus
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input}
          suppressHydrationWarning
          className="rounded-full"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  )
}

const ThinkingAnimation = ({ text }: { text: string }) => {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      <span>{text}</span>
      <span>{dots}</span>
    </span>
  )
}
