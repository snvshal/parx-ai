"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { SendHorizontal } from "lucide-react"
import { Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.candidates[0].content.parts[0].text,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(true)

      // Simulate typing effect completion
      setTimeout(() => {
        setIsTyping(false)
      }, assistantMessage.content.length * 75 + 1000) // Adjust timing based on content length
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your message. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex relative h-[calc(100vh-50px)] w-full flex-col max-sm:border-0">
      <ScrollArea className="flex-1 sm:p-4 " ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, i) => (
            <ChatMessage
              key={i}
              message={message}
              isTyping={
                isTyping &&
                i === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}
          {isLoading && <ThinkingAnimation />}
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
        onSubmit={sendMessage}
        className="flex items-center gap-2 bg-background border-t p-4 "
      >
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          suppressHydrationWarning
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading}
          suppressHydrationWarning
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  )
}

export function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Thinking...</span>
    </div>
  )
}
