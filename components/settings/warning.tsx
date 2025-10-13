"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { TriangleAlertIcon, XIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function WarningComponent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasDismissed = localStorage.getItem("warningDismissed")
    if (!hasDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("warningDismissed", "true")
  }

  if (!isVisible) return null

  return (
    <Alert variant="warning" className="group relative mb-4">
      <AlertTitle className="mb-2 flex items-center gap-2">
        <TriangleAlertIcon className="h-5 w-5" aria-hidden={true} />
        <span>Warning</span>
      </AlertTitle>
      <AlertDescription>
        Please review our{" "}
        <Link
          target="_blank"
          href="/about/terms-of-use"
          className="underline hover:text-yellow-700/95"
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          target="_blank"
          href="/about/privacy-policy"
          className="underline hover:text-yellow-700/95"
        >
          Privacy Policy
        </Link>{" "}
        before adding instructions.
      </AlertDescription>
      <button
        onClick={handleClose}
        className="absolute right-2 top-2 p-1 opacity-50 transition-opacity group-hover:opacity-100"
        aria-label="Dismiss warning"
      >
        <XIcon className="h-4 w-4" aria-hidden={true} />
      </button>
    </Alert>
  )
}
