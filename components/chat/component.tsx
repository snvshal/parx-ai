"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat/message"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BotIcon,
  CircleHelpIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  MessageCircleIcon,
  // FlagIcon,
  // InfoIcon,
  SendHorizontalIcon,
  SettingsIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { Message, UIMessage } from "ai"
import { useRouter } from "next/navigation"
import { AlertMessage } from "../co"

export function Chat({ persona, msgs }: { persona: TUser; msgs: Message[] }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    // setMessages,
  } = useChat({
    // api: "/api/chat",
    initialMessages: msgs,
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // console.log("Chat messages:", messages, msgs)
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

  // useEffect(() => setMessages(msgs), [setMessages])

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border">
      {/* Chat Header */}
      <div className="z-10 flex items-center justify-between border-b px-4 py-3">
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
          <ChatDropdownMenu name={persona.name} username={persona.username} />
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4">
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
      <div className="z-10 border-t bg-background p-4">
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

function ThinkingAnimation() {
  return (
    <div className="my-4 flex items-end gap-2">
      <div className="flex gap-1 rounded-2xl bg-accent p-4">
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

function ChatDropdownMenu({
  name,
  username,
}: {
  name: string
  username: string
}) {
  const { status } = useSession()
  const router = useRouter()

  const handleShare = async () => {
    try {
      const shareData = {
        title: "Check this out!",
        text: "Meet my AI! It can chat on my behalf and respond just like me:\n",
        url: window.location.href,
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        throw new Error("Web Share not supported")
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("User canceled sharing")
      } else {
        console.error("Error sharing:", error)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <EllipsisVerticalIcon
            className="h-5 w-5 text-foreground/80"
            aria-hidden={true}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{name} AI</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/m/${username}/what-is-it`}>
          <DropdownMenuItem className="h-9 cursor-pointer">
            <CircleHelpIcon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>What is it?</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          {status === "authenticated" ? (
            <DropdownMenuItem className="h-9 cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Settings</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="h-9 cursor-pointer">
              <SparklesIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Make My AI</span>
            </DropdownMenuItem>
          )}
        </Link>
        <DropdownMenuItem
          role="button"
          onClick={() => router.push("/m")}
          className="h-9 cursor-pointer"
        >
          <MessageCircleIcon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>Chats</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          role="button"
          onClick={() => router.push("/people")}
          className="h-9 cursor-pointer"
        >
          <UsersIcon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>People</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          role="button"
          onClick={handleShare}
          className="h-9 cursor-pointer"
        >
          <Share2Icon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FlagIcon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>Report Chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Chat
