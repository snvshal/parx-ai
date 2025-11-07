"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat/message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, SendHorizontalIcon } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import Link from "next/link"
import { AlertMessage } from "../co"
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard"
import { ChatDropdownMenu, ThinkingAnimation } from "./components"
import InstallPWA from "../install-pwa"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

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

  const { messages, sendMessage, status, error } = useChat({
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
        "chat-container mx-auto flex h-screen w-full max-w-2xl flex-col overflow-hidden",
        token
          ? "lg:h-[calc(100dvh-2rem)] lg:rounded-3xl lg:border"
          : "sm:h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border",
      )}
    >
      <div className="z-10 flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
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
              <p className="text-xs text-muted-foreground">
                {status === "streaming" ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InstallPWA />
            <ChatDropdownMenu
              id={String(persona._id)}
              name={persona.name}
              username={persona.username}
            />
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4">
        <div>
          {messages.map((message) => (
            <MemoChatMessage key={message.id} message={message} />
          ))}
          {status === "streaming" && <ThinkingAnimation />}
          {error && (
            <AlertMessage
              message="Something went wrong. Please try again."
              className="mb-4"
            />
          )}
        </div>
      </ScrollArea>

      <div className="z-10 flex-shrink-0 border-t bg-background p-4">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <Input
            ref={inputRef}
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            className="flex-1 rounded-full border-muted bg-muted/80 px-4"
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
