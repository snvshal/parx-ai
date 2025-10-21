"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthSuccess() {
  const router = useRouter()

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage("SIGNED_IN", "*")
      window.close()
    } else {
      router.replace("/")
    }
  }, [router])

  return null
}
