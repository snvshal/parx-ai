"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat/message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, SendHorizontalIcon } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import Link from "next/link"
import { Message } from "ai"
import { AlertMessage } from "../co"
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard"
import { ChatDropdownMenu, ThinkingAnimation } from "./components"
import InstallPWA from "../install-pwa"

export default function Chat({
  persona,
  msgs,
}: {
  persona: TUser
  msgs: Message[]
}) {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    initialMessages: msgs,
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  useMobileKeyboard()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSubmit(event, {
      body: { username: persona.username },
    })
  }

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "ready" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      )
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }, [messages])

  return (
    <div className="chat-container mx-auto flex h-screen w-full max-w-2xl flex-col overflow-hidden lg:h-[calc(100dvh-2rem)] lg:rounded-3xl lg:border">
      <div className="z-10 flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={persona.avatar}
                alt={persona.name || "Avatar"}
              />
              <AvatarFallback>
                <BotIcon className="h-4 w-4" aria-hidden={true} />
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
                {status === "submitted" ? "Typing..." : "Online"}
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

      {/* Chat Messages */}
      <ScrollArea
        ref={scrollAreaRef}
        className="min-h-0 flex-1 overflow-y-auto px-4"
      >
        <div>
          {messages.map((message, i) => (
            <MemoChatMessage key={i} message={message} />
          ))}
          {status === "submitted" && <ThinkingAnimation />}
          {status === "error" && (
            <AlertMessage
              message="Something went wrong. Please try again."
              className="mb-4"
            />
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="z-10 flex-shrink-0 border-t bg-background p-4">
        <form
          onSubmit={input.trim() ? onSubmit : (e) => e.preventDefault()}
          className="flex items-center gap-3"
        >
          <Input
            ref={inputRef}
            name="message"
            placeholder="Message..."
            value={input}
            onChange={handleInputChange}
            disabled={!(status === "ready")}
            className="flex-1 rounded-full border-muted bg-muted/80 px-4"
            autoComplete="off"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!(status === "ready") || !input.trim()}
            className="rounded-full"
          >
            <SendHorizontalIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
