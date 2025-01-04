"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Bot, SendHorizontal } from "lucide-react"
import { useChat } from "ai/react"
import { useEffect, useRef } from "react"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        )
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }

    // Use setTimeout to ensure the scroll happens after the DOM has updated
    setTimeout(scrollToBottom, 0)
  }, [messages, isLoading])

  return (
    <Card className="flex h-[calc(100vh-50px)] max-sm:py-12 w-full rounded-3xl flex-col max-sm:border-0">
      <ScrollArea
        className="flex-1 p-4 sm:p-8 overflow-y-auto scroll-smooth"
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <ThinkingAnimation />
          )}
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Send a message to start the conversation
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={input.trim() ? handleSubmit : (e) => e.preventDefault()}
        className="flex max-sm:fixed z-20 max-sm:bottom-0 max-sm:left-0 max-sm:right-0 m-4 items-center gap-2 border rounded-full p-2"
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
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          suppressHydrationWarning
          className="rounded-full"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  )
}

export function ThinkingAnimation() {
  return (
    <div className="flex w-full items-start gap-4 rounded-2xl p-4 bg-background">
      <div className="rounded-full bg-gray-400 p-2">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  )
}
