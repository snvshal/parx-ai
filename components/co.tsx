"use client"

import { useEffect, useRef } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TriangleAlertIcon } from "lucide-react"
import { Card } from "./ui/card"
import { cn } from "@/lib/utils"

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
      <div className="flex w-full items-center justify-center gap-3">
        <TriangleAlertIcon className="self-start" />
        <AlertDescription className="flex-1">{message}</AlertDescription>
      </div>
    </Alert>
  )
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export function ChatListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:gap-4 sm:p-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card
            key={i}
            className="p-4 max-sm:rounded-none max-sm:border-0 max-sm:border-b"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
