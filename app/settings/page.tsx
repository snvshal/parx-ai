import { SettingsComponent } from "@/components/settings/settings-list"
import { getSessionUser } from "../actions/session-user"

async function Settings() {
  const user = await getSessionUser()
  if (!user) return null
  return <SettingsComponent />
}
export default async function SettingsPage() {
  return <Settings />
}
