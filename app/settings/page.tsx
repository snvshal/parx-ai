import { getSessionUser } from "./[category]/actions"
import { SettingsComponent } from "./components"

export default async function SettingsPage() {
  const user = await getSessionUser()

  return <SettingsComponent user={JSON.parse(JSON.stringify(user))} />
}
