"use client"

import { createContext, useContext, useMemo } from "react"

export type ContextUser = {
  id: string
  username: string
  name: string
  email: string
  avatar: string
}

type UserContextType = {
  user: ContextUser | null
}

const UserContext = createContext<UserContextType | null>(null)

type SessionUserProviderProps = {
  children: React.ReactNode
  initialUser: ContextUser | null
}

export function SessionUserProvider({
  children,
  initialUser,
}: SessionUserProviderProps) {
  const value = useMemo(() => ({ user: initialUser }), [initialUser])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useSessionUser() {
  const ctx = useContext(UserContext)
  if (!ctx)
    throw new Error("useSessionUser must be used within a SessionUserProvider")
  return ctx
}
