"use client"

import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeaderComponent({
  page,
  children,
  actionItem,
  className,
}: {
  page: string
  children: React.ReactNode
  actionItem?: React.ReactElement
  className?: string
}) {
  const router = useRouter()
  return (
    <div className="h-dvh w-full">
      <header className="bg-background sticky top-0 z-20 box-border h-16 border-b">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
          <div className="flex gap-4">
            <button onClick={() => router.back()} className="cursor-pointer">
              <ArrowLeftIcon className="h-7 w-7" aria-hidden={true} />
            </button>
            <p className="text-xl font-bold">{page}</p>
          </div>
          <div>{actionItem}</div>
        </div>
      </header>
      <main
        className={cn(
          "box-border h-[calc(100dvh-4rem)] overflow-auto scroll-smooth px-4 py-6",
          className,
        )}
      >
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  )
}

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
