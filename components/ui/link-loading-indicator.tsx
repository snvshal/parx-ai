"use client"

import { cn } from "@/lib/utils"
import { useLinkStatus } from "next/link"

export default function LinkLoadingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "ml-1 inline-block h-2.5 w-2.5 rounded-full bg-current",
        "invisible opacity-0",
        pending && "visible animate-pulse",
      )}
    />
  )
}
