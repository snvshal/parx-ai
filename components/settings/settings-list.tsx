"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeftIcon,
  SettingsIcon,
  User2Icon,
  UserCircle2Icon,
  BookAIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { usePathname, useRouter } from "next/navigation"
import { ScrollArea } from "../ui/scroll-area"
import LinkLoadingIndicator from "../ui/link-loading-indicator"

const items = [
  {
    title: "General",
    url: "/settings/general",
    icon: SettingsIcon,
  },
  {
    title: "Profile",
    url: "/settings/profile",
    icon: User2Icon,
  },
  {
    title: "Instructions",
    url: "/settings/instructions",
    icon: BookAIcon,
  },
  {
    title: "Account",
    url: "/settings/account",
    icon: UserCircle2Icon,
  },
]

export function SettingsHeader({
  page,
  children,
}: {
  page: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <p className="flex p-6 pb-0 text-xl font-bold">
        <span className="w-full border-b pb-4">{page}</span>
      </p>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}

export function SettingsSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex h-[calc(100dvh-2rem)] w-full max-sm:h-dvh max-sm:flex-col">
      <aside className="bg-muted/30 w-full shrink-0 border-r p-4 sm:h-full sm:max-w-[220px]">
        <div className="mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        <nav className="flex gap-2 max-sm:flex-wrap sm:flex-col">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  isActive ? "bg-muted text-foreground" : "hover:bg-muted",
                )}
                replace
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                <LinkLoadingIndicator />
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 max-sm:min-h-0">
        <ScrollArea className="h-full overflow-y-auto">{children}</ScrollArea>
      </main>
    </div>
  )
}
