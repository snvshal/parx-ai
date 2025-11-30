import { Suspense } from "react"
import { getProfile } from "@/app/actions/settings/profile"
import { getInstructions } from "@/app/actions/settings/instruction"
import {
  SettingsSidebar,
  SettingsSkeleton,
} from "@/components/settings/settings-list"
import { notFound } from "next/navigation"

async function SettingsSidebarAs({ category }: { category: string }) {
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

export default async function SettingsCategory({
  params,
}: PageProps<"/settings/[category]">) {
  const { category } = await params
  const settingsList = ["general", "profile", "instructions", "account"]

  if (!settingsList.includes(category)) notFound()

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsSidebarAs category={category} />
    </Suspense>
  )
}
