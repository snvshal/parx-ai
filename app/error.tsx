"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex items-center justify-center flex-col">
        <h2 className="text-2xl mb-4">Something went wrong!</h2>
        <Button onClick={() => reset()}>Reload</Button>
      </div>
    </div>
  )
}
