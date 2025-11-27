import { getProfile } from "@/app/actions/settings/profile"
import { getInstructions } from "@/app/actions/settings/instruction"
import { SettingsSidebar } from "@/components/settings/settings-list"

export default async function SettingsCategory({
  params,
}: PageProps<"/settings/[category]">) {
  const category = (await params).category
  const profile = await getProfile()
  const instructions = await getInstructions()
  return (
    <SettingsSidebar
      category={category}
      profile={profile}
      instructions={instructions}
    />
  )
}
