"use client"

import { useEffect, useRef } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TriangleAlertIcon } from "lucide-react"

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
