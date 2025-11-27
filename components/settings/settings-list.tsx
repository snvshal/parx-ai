"use client"

import React, { useState } from "react"
import {
  SettingsIcon,
  User2Icon,
  UserCircle2Icon,
  BookAIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { notFound, usePathname } from "next/navigation"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { TInstruction } from "@/schemas/instruction.schema"
import { ProfileSettings, ProfileSettingsProps } from "./profile"
import GeneralSettings from "./general"
import { InstructionSettings } from "./instruction"
import AccountSettings from "./account"

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
export type SettingsPage = "general" | "instructions" | "profile" | "account"
export function SettingsSidebar({
  category,
  profile,
  instructions,
}: {
  category: string
  profile: ProfileSettingsProps
  instructions: TInstruction[]
}) {
  const pathname = usePathname()
  const [page, setPage] = useState(category)

  const settingsNavs = (page: string) => {
    setPage(page)
    window.history.replaceState(null, "", `/settings/${page}`)
  }
  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full max-sm:h-dvh max-sm:flex-col">
      <aside className="bg-muted/30 w-full shrink-0 border-r p-4 sm:h-full sm:max-w-[220px]">
        <div className="mb-8">
          <p className="text-muted-foreground text-xl font-semibold">
            Settings
          </p>
        </div>
        <nav className="flex gap-2 max-sm:flex-wrap sm:flex-col">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <Button
                key={item.title}
                onClick={() => settingsNavs(item.title.toLocaleLowerCase())}
                className={cn(
                  "flex items-center justify-start gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  isActive ? "bg-muted text-foreground" : "hover:bg-muted",
                )}
                variant="ghost"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 max-sm:min-h-0">
        <ScrollArea className="h-full overflow-y-auto">
          <SettingsComponent
            category={page}
            profile={profile}
            instructions={instructions}
          />
        </ScrollArea>
      </main>
    </div>
  )
}

export function SettingsComponent({
  category,
  profile,
  instructions,
}: {
  category: string
  profile: ProfileSettingsProps
  instructions: TInstruction[]
}) {
  switch (category) {
    case "general":
      return <GeneralSettings />

    case "profile":
      return <ProfileSettings profile={profile} />

    case "instructions":
      return <InstructionSettings inst={instructions} />

    case "account":
      return <AccountSettings />

    default:
      return notFound()
  }
}
