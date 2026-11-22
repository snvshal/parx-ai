"use client"

import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export function HeaderComponent({
  page,
  children,
  actionItem,
  className,
  backHref,
}: {
  page: string
  children: React.ReactNode
  actionItem?: React.ReactElement
  className?: string
  backHref?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <div className="h-dvh w-full">
      <header className="bg-background sticky top-0 z-20 box-border h-16 border-b">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
          <div className="flex gap-4">
            <button onClick={handleBack} className="cursor-pointer">
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
    <div className="flex h-full w-full flex-col overflow-hidden">
      <p className="flex p-6 pb-4 text-xl font-semibold">
        <span className="w-full">{page}</span>
      </p>
      <div className="px-6">
        <Separator />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="px-6 pt-6">{children}</div>
      </div>
    </div>
  )
}
