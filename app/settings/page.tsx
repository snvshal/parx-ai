import { SettingsComponent } from "@/components/settings/settings-list"
import { getSessionUser } from "../actions/session-user"
import { ps } from "@/lib/utils"

async function Settings() {
  // "use cache: private"
  const user = await getSessionUser()
  if (!user) return null
  return <SettingsComponent user={ps(user)} />
}
export default async function SettingsPage() {
  return <Settings />
}
