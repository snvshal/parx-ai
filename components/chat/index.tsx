"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat/message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, LogInIcon, SendHorizontalIcon } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import Link from "next/link"
import { AlertMessage } from "../co"
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard"
import { ChatDropdownMenu, ThinkingAnimation } from "./components"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "../ui/sidebar"

export default function Chat({
  persona,
  msgs,
}: {
  persona: TUser
  msgs: UIMessage[]
}) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { status: authStatus } = useSession()
  const token = authStatus === "authenticated"

  const { messages, sendMessage, setMessages, status, error } = useChat({
    messages: msgs,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (err) => console.error("Chat error:", err),
  })

  useMobileKeyboard()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input, metadata: { username: persona.username } })
    setInput("")
  }

  useEffect(() => {
    if (status === "ready" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100)
    }
  }, [status])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      )
      if (scrollElement) {
        requestAnimationFrame(() =>
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          }),
        )
      }
    }
  }, [messages])

  return (
    <div
      className={cn(
        "chat-container mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden",
        token
          ? "lg:h-[calc(100dvh-2rem)] lg:rounded-3xl lg:border"
          : "sm:h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border",
      )}
    >
      <div className="z-10 flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={persona.avatar}
                alt={persona.name || "Avatar"}
              />
              <AvatarFallback>
                <BotIcon className="h-4 w-4" aria-hidden />
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                target={persona.socialLink ? "_blank" : "_self"}
                href={persona.socialLink || `/m/${persona.username}`}
                className="text-sm font-medium hover:underline"
              >
                {persona.name}
              </Link>
              <p className="text-muted-foreground text-xs">
                {status === "streaming" ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {token ? (
              <SidebarTrigger
                variant="ghost"
                size="icon"
                className="text-foreground/80 size-9 rounded-full"
              />
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            )}
            <ChatDropdownMenu setMessages={setMessages} />
          </div>
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4">
        <div>
          {messages.map((message) => (
            <MemoChatMessage key={message.id} message={message} />
          ))}
          {status === "submitted" && <ThinkingAnimation />}
          {error && (
            <AlertMessage
              message="Something went wrong. Please try again."
              className="mb-4"
            />
          )}
        </div>
      </ScrollArea>

      <div className="bg-background z-10 shrink-0 border-t p-4">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <Input
            ref={inputRef}
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            className="border-muted bg-muted/80 flex-1 rounded-full px-4"
            autoComplete="off"
          />

          <Button
            type="submit"
            size="icon"
            disabled={status !== "ready" || !input.trim()}
            className="rounded-full"
          >
            <SendHorizontalIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
