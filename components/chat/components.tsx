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
  UsersIcon,
} from "lucide-react"
import { useState, useTransition } from "react"
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
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteMessages } from "@/app/actions/chat"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function ThinkingAnimation() {
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

export function ChatDropdownMenu({
  id,
  name,
  username,
}: {
  id: string
  name: string
  username: string
}) {
  const { status } = useSession()
  const router = useRouter()
  const [openDeleteChat, setOpenDeleteChat] = useState(false)

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
    <>
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
            <DropdownMenuItem
              role="button"
              onClick={() => router.push("/m")}
              className="h-9 cursor-pointer"
            >
              <MessageCircleIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Chats</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            role="button"
            onClick={() => router.push("/people")}
            className="h-9 cursor-pointer"
          >
            <UsersIcon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>People</span>
          </DropdownMenuItem>
          {status === "authenticated" && (
            <DropdownMenuItem
              role="button"
              onClick={() => setOpenDeleteChat(true)}
              className="h-9 cursor-pointer"
            >
              <RotateCcwIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Reset Chat</span>
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
        personaId={id}
        personaName={username}
        open={openDeleteChat}
        setOpen={setOpenDeleteChat}
      />
    </>
  )
}

function DeleteChatAlert({
  open,
  setOpen,
  personaId,
  personaName,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  personaId: string
  personaName: string
}) {
  const [isPending, startTransition] = useTransition()

  const deleteChatFunc = () => {
    startTransition(async () => {
      try {
        const { success } = await deleteMessages(personaId)
        if (success) {
          toast({ description: "Chat deleted successfully!" })
        }
      } catch (error) {
        console.error(error)
        toast({ description: "Error deleting chat.", variant: "destructive" })
      } finally {
        setOpen(false)
      }
    })
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="hidden">Delete chat</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. It will reset and permanently delete
            your previous messages with @{personaName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteChatFunc}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            {isPending ? "Processing..." : "Reset Chat"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Extracted fallback skeleton for Suspense streaming
export function ChatListSidebarSkeleton() {
  return (
    <aside className="w-80 border-r bg-background p-4 max-sm:hidden">
      <h2 className="mb-4 text-lg font-semibold">Chats</h2>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </aside>
  )
}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}
