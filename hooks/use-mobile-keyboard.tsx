"use client"

import { useEffect, useState } from "react"

export const setAppHeight = () => {
  if (typeof window === "undefined") return

  // Use visualViewport.height for mobile, fallback to window.innerHeight
  const vh = window.visualViewport?.height || window.innerHeight

  // Also set a CSS custom property for the keyboard height difference
  const keyboardHeight = window.innerHeight - vh
  document.documentElement.style.setProperty(
    "--keyboard-height",
    `${keyboardHeight}px`,
  )
}

export const initializeViewportHeight = () => {
  if (typeof window === "undefined") return

  // Set initial height
  setAppHeight()

  // Listen for viewport changes
  const handleViewportChange = () => {
    setAppHeight()
  }

  // Listen for both resize and visual viewport changes
  window.addEventListener("resize", handleViewportChange)

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportChange)
  }

  // Cleanup function
  return () => {
    window.removeEventListener("resize", handleViewportChange)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", handleViewportChange)
    }
  }
}

export function useMobileKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    let initialViewportHeight =
      window.visualViewport?.height || window.innerHeight

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight

      // If the height difference is significant (more than 200px), keyboard is likely open
      const heightDifference = initialViewportHeight - currentHeight
      setIsKeyboardOpen(heightDifference > 200)
    }

    const handleFocus = () => {
      // Set initial height when input gets focus
      initialViewportHeight =
        window.visualViewport?.height || window.innerHeight
    }

    // Initialize viewport height management
    const cleanup = initializeViewportHeight()

    // Listen for resize events
    window.addEventListener("resize", handleResize)

    // Also listen for visual viewport changes (more accurate for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
    }

    // Listen for focus events on inputs
    document.addEventListener("focusin", handleFocus)

    return () => {
      cleanup?.()
      window.removeEventListener("resize", handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
      }
      document.removeEventListener("focusin", handleFocus)
    }
  }, [])

  return isKeyboardOpen
}
