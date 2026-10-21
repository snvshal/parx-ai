"use client"

import {
  useEffect,
  useRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucideProps, TriangleAlertIcon } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSessionUser } from "@/hooks/use-session-user"

export type AlertMessageProps = {
  message: React.ReactNode | string | null | undefined
  variant?: "destructive" | "default" | "success" | "warning"
  className?: string
  action?: React.ReactNode
}

export type DialogProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  action: () => void
  trigger: React.ReactElement
  hidden?: boolean
  actionName: string
  title: string
  description: string
}

export type ListNavItemsProps = {
  items: {
    title: string
    url: string
    badge?: string | number
    Icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
  }[]
  className?: string
}

export function AlertMessage({
  message,
  variant = "destructive",
  className,
  action,
}: AlertMessageProps) {
  const alertRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (message && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "center" })

      if (alertRef.current.focus) alertRef.current.focus()
    }
  }, [message])

  if (!message) return null

  return (
    <Alert variant={variant} className={className} ref={alertRef} tabIndex={-1}>
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <TriangleAlertIcon className="shrink-0 self-start" />
          <AlertDescription className="flex-1">{message}</AlertDescription>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Alert>
  )
}

export function AlertDialogComponent({
  open,
  setOpen,
  action,
  trigger,
  hidden = false,
  actionName,
  title,
  description,
}: DialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => startTransition(action)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className={cn(hidden && "hidden")} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleClick}
            disabled={isPending}
          >
            {actionName}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ListNavItems({ items, className }: ListNavItemsProps) {
  const pathname = usePathname()
  return (
    <>
      {items.map((item, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton isActive={pathname === item.url} asChild>
            <Link
              href={item.url}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                className,
              )}
            >
              <item.Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge className="h-[calc(100%-12px)]">
            {item.badge}
          </SidebarMenuBadge>
        </SidebarMenuItem>
      ))}
    </>
  )
}

export function SlotDialog({
  children,
  page,
}: {
  children: React.ReactNode
  page: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useSessionUser()
  const adjustedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return

    const origin = window.location.origin
    const ref = document.referrer ?? ""
    const isExternalRef = ref === "" || !ref.startsWith(origin)

    if (!adjustedRef.current && isExternalRef) {
      adjustedRef.current = true

      window.history.pushState(
        null,
        "",
        user ? `/m/${user.username}` : "/m/snvshal",
      )

      window.history.pushState(null, "", pathname)
    }
  }, [pathname, user])

  return (
    <Dialog open={pathname.startsWith(page)} onOpenChange={() => router.back()}>
      <DialogContent className="box-border h-[calc(100dvh-4rem)] gap-0 overflow-hidden p-0 max-sm:h-dvh sm:max-w-3xl xl:max-h-140">
        <DialogTitle className="hidden"></DialogTitle>
        <DialogDescription className="hidden"></DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}
