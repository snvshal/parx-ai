"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat/message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, RotateCcwIcon, SendHorizontalIcon } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { AlertMessage } from "../co"
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard"
import { ChatDropdownMenu, ThinkingAnimation } from "./components"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "../ui/sidebar"
import { useCurrentPersona } from "@/hooks/use-current-persona"

export default function Chat({ msgs }: { msgs: UIMessage[] }) {
  const persona = useCurrentPersona()
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { status: authStatus } = useSession()
  const token = authStatus === "authenticated"

  const [agentStatus, setAgentStatus] = useState<string | null>(null)

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    regenerate,
    clearError,
  } = useChat({
    messages: msgs,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (err) => console.error("Chat error:", err),
    onData: useCallback((chunk: Record<string, unknown>) => {
      if (chunk.type === "data-agent-status") {
        flushSync(() => {
          setAgentStatus((chunk.data as { status?: string })?.status ?? null)
        })
      }
    }, []),
  })

  useMobileKeyboard()

  const handleRetry = useCallback(() => {
    if (!messages.length) return
    clearError()
    regenerate().catch((err) => console.error("Chat retry error:", err))
  }, [messages.length, clearError, regenerate])

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({
      text: input,
      metadata: { username: persona.username, createdAt: new Date() },
    })
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
        "chat-container bg-card shadow-card mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden",
        token
          ? "lg:h-[calc(100dvh-2rem)] lg:rounded-3xl lg:border"
          : "md:h-[calc(100dvh-2rem)] md:rounded-3xl md:border",
        "sm:border-x",
      )}
    >
      <div className="z-10 flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={persona.avatar}
                alt={persona.name || "Avatar"}
                className="object-cover"
              />
              <AvatarFallback>
                <BotIcon className="h-4 w-4" aria-hidden />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium tracking-tight">
                {persona.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {status === "submitted" || status === "streaming"
                  ? agentStatus || "Thinking..."
                  : "Online"}
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
                <Button
                  variant="default"
                  size="sm"
                  className="mr-2 rounded-full"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <ChatDropdownMenu setMessages={setMessages} />
          </div>
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4">
        <div className="flex flex-col gap-4 py-4">
          {messages.map((message) => (
            <MemoChatMessage key={message.id} message={message} />
          ))}
          {status === "submitted" && <ThinkingAnimation />}
          {(error || status === "error") && (
            <AlertMessage
              message="Something went wrong. Please try again."
              className="mb-4"
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRetry}
                  className="text-foreground rounded-full"
                  title="Retry"
                  aria-label="Retry"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </div>
      </ScrollArea>

      <div className="border-border/50 z-10 shrink-0 border-t bg-white/2 p-4">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <Input
            name="message"
            ref={inputRef}
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            className="border-muted shadow-surface flex-1 rounded-full bg-white/4 px-4"
            autoComplete="off"
          />

          <Button
            type="submit"
            size="icon"
            disabled={status !== "ready" || !input.trim()}
            className="h-10 w-10 rounded-full"
          >
            <SendHorizontalIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
