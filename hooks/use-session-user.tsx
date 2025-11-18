"use client"

import { createContext, useContext, useMemo } from "react"

export type ContextUser = {
  id: string
  username: string
  name: string
  email: string
  avatar: string
}

const UserContext = createContext<ContextUser | null>(null)

type SessionUserProviderProps = {
  children: React.ReactNode
  initialUser: ContextUser | null
}

export function SessionUserProvider({
  children,
  initialUser,
}: SessionUserProviderProps) {
  const value = useMemo(() => initialUser, [initialUser])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useSessionUser() {
  return useContext(UserContext)
}
