"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        <span className="inline-block min-w-16">Loading...</span>
      </div>
    </div>
  )
}
