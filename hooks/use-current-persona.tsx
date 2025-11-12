"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"

export type ContextPersona = {
  id: string
  name: string
  username: string
  avatar?: string
  socialLink?: string
}

const PersonaContext = createContext<ContextPersona | undefined>(undefined)

export function PersonaProvider({
  children,
  initialPersona,
}: {
  children: ReactNode
  initialPersona: ContextPersona
}) {
  const value = useMemo(() => initialPersona, [initialPersona])
  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  )
}

export function useCurrentPersona() {
  const context = useContext(PersonaContext)
  if (!context)
    throw new Error("useCurrentPersona must be used within a PersonaProvider")
  return context
}
