"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MemoChatMessage } from "@/components/chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BotIcon,
  CircleHelpIcon,
  EllipsisVerticalIcon,
  // FlagIcon,
  // InfoIcon,
  SendHorizontalIcon,
  SettingsIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import Link from "next/link"
import { AlertMessage } from "@/app/settings/components"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"

export function Chat({ user }: { user: TUser }) {
  const params = useParams()

  const [error, setError] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    onError: () => setError(true),
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError(false)

    handleSubmit(
      { preventDefault: () => {} },
      {
        body: {
          username: params.username,
        },
      }
    )
  }

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }, [messages])

  useEffect(() => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content:
          user.firstMessage ||
          `Hey there! 😊 I'm ${user.name} bot. Feel free to ask me anything! What's on your mind? 💬`,
        createdAt: new Date(),
      },
    ])
  }, [setMessages, user.firstMessage, user.name])

  return (
    <div className="flex h-screen sm:h-[calc(100vh-2rem)] w-full sm:border sm:rounded-3xl sm:my-4 max-w-2xl mx-auto flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center gap-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.avatar} alt={user.name || "Avatar"} />
              <AvatarFallback>
                <BotIcon className="h-4 w-4" aria-hidden={true} />
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                target={user.socialLink ? "_blank" : "_self"}
                href={user.socialLink || `/m/${user.username}`}
                className="font-medium text-sm hover:underline"
              >
                {user.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {status === "submitted" ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <ChatDropdownMenu name={user.name} username={user.username} />
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 overflow-y-auto">
        <div>
          {messages.map((message, i) => (
            <MemoChatMessage key={i} message={message} />
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

      {/* Input Area */}
      <div className="border-t p-4 bg-background z-10">
        <form
          onSubmit={input.trim() ? onSubmit : (e) => e.preventDefault()}
          className="flex items-center gap-3"
        >
          <Input
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
    <div className="flex items-end gap-2 my-4">
      <div className="flex gap-1 bg-accent rounded-2xl p-4">
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check this out!",
          url: window.location.href,
          text: "Some description here",
        })
      } else {
        // Fallback for browsers that don't support Web Share
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback to clipboard if share fails
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
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
      <DropdownMenuContent>
        <DropdownMenuLabel>{name} AI</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/m/${username}/what-is-it`}>
          <DropdownMenuItem className="cursor-pointer">
            <CircleHelpIcon className="h-4 w-4 mr-2" aria-hidden={true} />
            <span>What is it?</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          {status === "authenticated" ? (
            <DropdownMenuItem className="cursor-pointer">
              <SettingsIcon className="h-4 w-4 mr-2" aria-hidden={true} />
              <span>Settings</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="cursor-pointer">
              <SparklesIcon className="h-4 w-4 mr-2" aria-hidden={true} />
              <span>Make My AI</span>
            </DropdownMenuItem>
          )}
        </Link>
        <DropdownMenuItem
          role="button"
          onClick={handleShare}
          className="cursor-pointer"
        >
          <Share2Icon className="h-4 w-4 mr-2" aria-hidden={true} />
          <span>Share</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <FlagIcon className="h-4 w-4 mr-2" aria-hidden={true} />
          <span>Report</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Chat
