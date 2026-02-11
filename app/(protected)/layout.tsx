import { getServerSession, Session } from "next-auth"
import SessionProviderComponent from "@/components/session-provider"
import { SessionUserProvider } from "@/hooks/use-session-user"
import { getContextUser } from "../actions/session-user"

export const dynamic = "force-dynamic"

export default async function ProtectedLayout({
  children,
  settingsmodal,
  peoplemodal,
  chatsmodal,
}: {
  children: React.ReactNode
  settingsmodal: React.ReactNode
  peoplemodal: React.ReactNode
  chatsmodal: React.ReactNode
}) {
  const contextUser = await getContextUser()
  const session: Session | null = await getServerSession()

  return (
    <SessionProviderComponent session={session}>
      <SessionUserProvider initialUser={contextUser}>
        {children}
        {settingsmodal}
        {peoplemodal}
        {chatsmodal}
      </SessionUserProvider>
    </SessionProviderComponent>
  )
}
