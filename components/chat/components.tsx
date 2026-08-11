"use client"

import { Button } from "@/components/ui/button"
import {
  CircleHelpIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  RotateCcwIcon,
  Share2Icon,
  TrashIcon,
  UsersIcon,
} from "lucide-react"
import { memo, useState } from "react"
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
import { deleteChat, deleteMessages } from "@/app/actions/chat"
import { Skeleton } from "../ui/skeleton"
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
import Link from "next/link"
import { useSessionUser } from "@/hooks/use-session-user"
import { useCurrentPersona } from "@/hooks/use-current-persona"
import { useChatList } from "@/hooks/use-chat-list"

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
  const user = useSessionUser()
  const { status } = useSession()
  const { username } = useParams()
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
        console.error("Sharing canceled")
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
              className="text-foreground/80"
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

          {status === "unauthenticated" && (
            <Link href="/people">
              <DropdownMenuItem className="h-9 cursor-pointer">
                <UsersIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>People</span>
              </DropdownMenuItem>
            </Link>
          )}

          {status === "authenticated" && (
            <>
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
              {!(user?.username === username) && (
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
            </>
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
  const router = useRouter()
  const user = useSessionUser()
  const persona = useCurrentPersona()
  const { setList } = useChatList()
  const [isLoading, setIsLoading] = useState(false)

  const deleteChatFunc = async () => {
    setIsLoading(true)
    try {
      if (action === "delete") {
        router.replace(`/m/${user?.username}`)

        const { success } = await deleteChat(persona.id)
        if (success) {
          setList((prev) =>
            prev.filter((chat) => chat.personaId.username !== persona.username),
          )
          setIsLoading(false)
          toast.success("Chat deleted successfully!")
        }
      } else if (action === "reset") {
        const { success, firstMessage } = await deleteMessages(persona.id)
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
            your previous messages with @{persona.username}.
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

export function ChatBoxSkeleton() {
  const { status: authStatus } = useSession()
  const token = authStatus === "authenticated"
  return (
    <div
      className={cn(
        "chat-container bg-card shadow-card mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden",
        token
          ? "lg:h-[calc(100dvh-2rem)] lg:rounded-3xl lg:border"
          : "md:h-[calc(100dvh-2rem)] md:rounded-3xl md:border",
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
      <div className="border-border/50 z-10 shrink-0 border-t bg-white/2 p-4">
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
            <ScrollArea className="h-full max-h-[calc(100dvh-8rem)] overflow-auto">
              <CardContent className="space-y-4 p-4 text-left text-sm">
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
                      router.push("/about/how-to-use")
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
