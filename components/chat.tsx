"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizontal, SmilePlus } from "lucide-react"
import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { ModeToggle } from "./ui/theme-provider"
import Image from "next/image"

export function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat()

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollElement) {
        const scroll = () => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          })
        }
        setTimeout(scroll, 100)
      }
    }
  }, [messages])

  useEffect(() => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content:
          "Hey there! 😊 I'm VSHAL bot. Feel free to ask me anything! What's on your mind? 💬",
      },
    ])
    console.log("Chat component mounted")
  }, [setMessages])

  return (
    <div className="flex h-screen sm:h-[calc(100vh-2rem)] w-full max-w-2xl mx-auto flex-col overflow-hidden rounded-xl sm:border bg-background">
      {/* Chat Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <Image
                src="https://github.com/snvshal.png"
                alt="VSHAL"
                height={36}
                width={36}
                className="rounded-md"
              />
            </div>
            <div>
              <h3 className="font-medium text-sm">VSHAL</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-2 py-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message, i) => (
              <ChatMessage key={i} message={message} />
            ))
          )}
          {isLoading && <ThinkingAnimation />}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <form
          onSubmit={input.trim() ? handleSubmit : (e) => e.preventDefault()}
          className="flex items-center gap-2"
        >
          {/* <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0 rounded-full"
          >
            <SmilePlus className="h-5 w-5 text-muted-foreground" />
          </Button> */}

          <Input
            placeholder="Message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1 rounded-full border-muted bg-muted/80 px-4"
            autoComplete="off"
            autoFocus
          />

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-9 w-9 shrink-0 rounded-full bg-primary"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Send a message to start the conversation
        </p>
      </div>
    </div>
  )
}

function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-primary/40"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default Chat
