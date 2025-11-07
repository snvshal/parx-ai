"use client"

import { Button } from "@/components/ui/button"
import {
  CircleHelpIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  SettingsIcon,
  Share2Icon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react"
import { memo, useState } from "react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChatSession, deleteChat, deleteMessages } from "@/app/actions/chat"
import { Skeleton } from "../co"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "@/lib/utils"
import { UIMessage } from "ai"

export function ThinkingAnimation() {
  return (
    <div className="my-4 flex items-end gap-2">
      <div className="bg-accent flex gap-1 rounded-2xl p-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-primary/40 inline-block h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export const ChatDropdownMenu = memo(function ChatDropdownMenu({
  setMessages,
}: {
  setMessages: (messages: UIMessage[]) => void
}) {
  const { status } = useSession()
  const [openDeleteChat, setOpenDeleteChat] = useState(false)
  const [action, setAction] = useState<"delete" | "reset" | undefined>(
    undefined,
  )
  const [IsDialogOpen, setIsDialogOpen] = useState(false)

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
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <EllipsisVerticalIcon
              className="text-foreground/80 h-5 w-5"
              aria-hidden={true}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem
            role="button"
            onClick={() => setIsDialogOpen(true)}
            className="h-9 cursor-pointer"
          >
            <CircleHelpIcon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>What is it?</span>
          </DropdownMenuItem>
          {status === "authenticated" ? (
            <Link href="/settings">
              <DropdownMenuItem className="h-9 cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
          ) : (
            <Link href="/sign-in">
              <DropdownMenuItem className="h-9 cursor-pointer">
                <SparklesIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>Make My AI</span>
              </DropdownMenuItem>
            </Link>
          )}
          {status === "authenticated" && (
            <Link href="/chats">
              <DropdownMenuItem className="h-9 cursor-pointer">
                <MessageCircleIcon
                  className="mr-2 h-4 w-4"
                  aria-hidden={true}
                />
                <span>Chats</span>
              </DropdownMenuItem>
            </Link>
          )}
          <Link href="/people">
            <DropdownMenuItem className="h-9 cursor-pointer">
              <UsersIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>People</span>
            </DropdownMenuItem>
          </Link>
          {status === "authenticated" && (
            <DropdownMenuItem
              role="button"
              onClick={() => {
                setOpenDeleteChat(true)
                setAction("reset")
              }}
              className="h-9 cursor-pointer"
            >
              <RotateCcwIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Reset Chat</span>
            </DropdownMenuItem>
          )}
          {status === "authenticated" && (
            <DropdownMenuItem
              role="button"
              onClick={() => {
                setOpenDeleteChat(true)
                setAction("delete")
              }}
              className="h-9 cursor-pointer"
            >
              <TrashIcon
                className="text-destructive hover:text-destructive mr-2 h-4 w-4"
                aria-hidden={true}
              />
              <span className="text-destructive hover:text-destructive">
                Delete Chat
              </span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="h-9 cursor-pointer">
            <FlagIcon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>Report Chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            role="button"
            onClick={handleShare}
            className="h-9 cursor-pointer"
          >
            <Share2Icon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>Share</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteChatAlert
        open={openDeleteChat}
        setOpen={setOpenDeleteChat}
        action={action as "delete" | "reset"}
        setMessages={setMessages}
      />
      <WhatIsItDialog open={IsDialogOpen} setOpen={setIsDialogOpen} />
    </div>
  )
})

function DeleteChatAlert({
  open,
  setOpen,
  action,
  setMessages,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  action: "delete" | "reset"
  setMessages: (messages: UIMessage[]) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { username } = useParams()
  const router = useRouter()
  const deleteChatFunc = async () => {
    setIsLoading(true)
    try {
      if (action === "delete") {
        router.replace("/chats")

        const { success } = await deleteChat(username as string)
        if (success) {
          setIsLoading(false)
          toast.success("Chat deleted successfully!")
        }
      } else if (action === "reset") {
        const { success, firstMessage } = await deleteMessages(
          username as string,
        )
        if (success && firstMessage) {
          setMessages([firstMessage])
          setIsLoading(false)
          toast.success("Chat reset successfully!")
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Error deleting chat.")
    } finally {
      setOpen(false)
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="hidden">Delete chat</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will reset and permanently delete
            your previous messages with @{username}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={deleteChatFunc}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : action === "delete"
                ? "Delete Chat"
                : "Reset Chat"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ChatListSidebarSkeleton({ count = 5 }: { count?: number }) {
  return (
    <aside className="bg-background w-80 border-r p-4 max-sm:hidden">
      <h2 className="mb-4 text-lg font-semibold">Chats</h2>
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </aside>
  )
}

export const ChatList = memo(function ChatList({
  chats,
}: {
  chats: ChatSession[]
}) {
  const { username } = useParams()
  return (
    <>
      {chats.map((chat) => (
        <Link
          key={chat.chatId}
          href={`/m/${chat.persona.username}`}
          style={{
            backgroundColor:
              username === chat.persona.username ? "var(--accent)" : "none",
          }}
          className="hover:bg-accent flex h-14 items-center gap-3 rounded-full p-2 md:w-72 md:rounded-lg"
        >
          <Avatar>
            <AvatarImage src={chat.persona.avatar} alt={chat.persona.name} />
            <AvatarFallback>
              {chat.persona.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left max-md:hidden">
            <span className="font-medium">{chat.persona.name}</span>
            <span className="text-muted-foreground line-clamp-1 text-sm">
              {chat.lastMessageContent}
            </span>
          </div>
        </Link>
      ))}
    </>
  )
})

export function ChatBoxSkeleton() {
  const { status: authStatus } = useSession()
  const token = authStatus === "authenticated"
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
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] space-y-2 rounded-2xl p-3 ${
                  i % 2 === 0 ? "bg-muted/50" : "bg-primary/10"
                }`}
              >
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                {i === 1 && <Skeleton className="h-4 w-20" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background z-10 shrink-0 border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export const WhatIsItDialog = memo(function WhatIsItDialog({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { username } = useParams()
  const router = useRouter()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="mb-4">What is this chatbot?</DialogTitle>
          <DialogDescription></DialogDescription>
          <Card>
            <ScrollArea className="h-full overflow-auto max-md:h-[calc(100dvh-8rem)]">
              <CardContent className="space-y-4 p-4">
                <p>
                  This chatbot is customized based on @{username}&#39;s defined
                  instructions. Its responses are influenced by system prompts
                  and preferences set by @{username}.
                </p>
                <h2 className="text-lg font-semibold">How does it work?</h2>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Custom instructions set by @{username} define response
                    behavior.
                  </li>
                  <li>
                    The chatbot&#39;s tone, knowledge, and preferences are
                    adjusted based on these instructions.
                  </li>
                  <li>
                    AI responses are generated using a combination of predefined
                    logic and model capabilities.
                  </li>
                </ul>
                <h2 className="text-lg font-semibold">
                  Can I make my own chatbot?
                </h2>
                <p>
                  Yes! You can personalize your own chatbot by defining how it
                  should respond, what knowledge it should focus on, and its
                  preferred style of interaction.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setOpen(false)
                      router.push("/settings")
                    }}
                  >
                    Create Your Own
                  </Button>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})
