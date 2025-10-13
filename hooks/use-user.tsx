"use client"

import { getContextUser } from "@/app/actions/chat"
import { createContext, useContext, useEffect, useState } from "react"

export type ContextUser = {
  id: string
  username: string
  name: string
  email: string
  avatar: string
}

type UserContextType = {
  user: ContextUser | null
  clearUser: () => void
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ContextUser | null>(null)

  useEffect(() => {
    const fetchContextUser = async () => {
      const contextUser = await getContextUser()
      setUser(contextUser)
    }

    fetchContextUser()
  }, [])

  const clearUser = () => setUser(null)

  return (
    <UserContext.Provider value={{ user, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used inside UserProvider")
  return ctx
}
