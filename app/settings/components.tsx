"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
import { useEffect, useRef, useTransition } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucideIcon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { HeaderComponent } from "@/components/header"
import {
  UserIcon,
  MailIcon,
  BookAIcon,
  SunIcon,
  LogOutIcon,
  MoonIcon,
  InfoIcon,
  SunMoonIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { TUser } from "@/schemas/user.schema"

export type ActionItemsProps = {
  role: "button" | "link" | "text"
  Icon: LucideIcon
  url?: string
  name: string | JSX.Element
  action?: () => void
  className?: string | string[]
}

export type DialogProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  action: () => void
  trigger: JSX.Element
  hidden?: boolean
  actionName: string
  title: string
  description: string
}

export type ThemeDialogProps = Pick<DialogProps, "open" | "setOpen">

export function SettingsComponent({ user }: { user: TUser }) {
  const { theme } = useTheme()

  const [openTheme, setOpenTheme] = useState(false)
  const [openSignOut, setOpenSignOut] = useState(false)

  const settingsItems: ActionItemsProps[] = [
    {
      role: "text",
      Icon: MailIcon,
      name: (
        <div className="flex items-start justify-center flex-col">
          <span className="leading-4">Email</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      ),
    },
    {
      role: "link",
      Icon: UserIcon,
      url: "/settings/profile",
      name: "Profile",
    },
    {
      role: "link",
      Icon: BookAIcon,
      url: "/settings/instructions",
      name: "Instructions",
      action: () => localStorage.setItem("addNewInstruction", "false"),
    },
    {
      role: "button",
      Icon:
        theme === "system"
          ? SunMoonIcon
          : theme === "dark"
          ? MoonIcon
          : SunIcon,
      name: `Theme (${theme})`,
      action: () => setOpenTheme(true),
    },
    {
      role: "link",
      Icon: InfoIcon,
      url: "/about",
      name: "About",
    },
    {
      role: "button",
      Icon: LogOutIcon,
      name: "Sign Out",
      className: "text-red-500 hover:bg-red-500/10",
      action: () => setOpenSignOut(true),
    },
  ]

  return (
    <HeaderComponent
      page="Settings"
      actionItem={
        <Button variant="outline">
          <SparklesIcon className="h-4 w-4" aria-hidden={true} />
          <Link href={`/m/${user.username}`}>My AI</Link>
        </Button>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-start gap-4 h-10 w-full px-4 rounded-md">
          <Avatar className="w-6 h-6">
            <AvatarImage src={user.avatar || ""} alt={user.name || "Avatar"} />
            <AvatarFallback className="text-sm">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </div>
        <ActionItems items={settingsItems} />
      </div>
      <ThemeDialog open={openTheme} setOpen={setOpenTheme} />
      <AlertDialogComponent
        open={openSignOut}
        setOpen={setOpenSignOut}
        action={signOut}
        trigger={<span>Sign Out</span>}
        hidden={true}
        actionName="Sign Out"
        title="Confirm Sign Out"
        description={`Are you sure you want to sign out? You will need to log in again to access your account.`}
      />
    </HeaderComponent>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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

export function ThemeDialog({ open, setOpen }: ThemeDialogProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span></span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={theme || "system"}
            onValueChange={(value) => setTheme(value)}
            className="grid gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
          </RadioGroup>
        </div>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export type AlertMessageProps = {
  message: React.ReactNode | string | null | undefined
  variant?: "destructive" | "default" | "success" | "warning"
  className?: string
}

export function AlertMessage({
  message,
  variant = "destructive",
  className,
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
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function ActionItems({ items }: { items: ActionItemsProps[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const { role, Icon, url, name, action, className } = item

        const baseClasses = cn(
          "flex items-center justify-start gap-4 h-10 w-full px-4 rounded-md",
          role !== "text" && "cursor-pointer hover:bg-accent",
          className
        )

        if (role === "link" && url) {
          return (
            <Link key={index} href={url} className={baseClasses}>
              <div className="w-6 flex items-center justify-center">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 flex justify-start">{name}</div>
            </Link>
          )
        }

        return (
          <div
            key={index}
            role={role === "button" ? "button" : undefined}
            tabIndex={role === "button" ? 0 : undefined}
            onKeyDown={(e) => {
              if (role === "button" && (e.key === "Enter" || e.key === " ")) {
                action?.()
              }
            }}
            onClick={action}
            className={baseClasses}
          >
            <div className="w-6 flex items-center justify-center">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 flex justify-start">
              {typeof name === "string" ? <span>{name}</span> : name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
