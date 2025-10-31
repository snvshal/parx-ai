export const dynamic = "force-dynamic"

import { SettingsComponent } from "@/components/settings/settings-list"
import { getSessionUser } from "../actions/session-user"

export default async function SettingsPage() {
  const user = await getSessionUser()

  return <SettingsComponent user={JSON.parse(JSON.stringify(user))} />
}
