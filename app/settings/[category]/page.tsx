import { getInstructions } from "@/app/actions/settings/instruction"
import { getProfile } from "@/app/actions/settings/profile"
import { InstructionSettings } from "@/components/settings/instruction"
import { ProfileSettings } from "@/components/settings/profile"
import { cacheTag } from "next/cache"
import { notFound } from "next/navigation"

async function Profile() {
  "use cache: private"
  cacheTag("settings-profile")
  const profile = await getProfile()
  return <ProfileSettings profile={profile} />
}

async function Instructions() {
  "use cache: private"
  cacheTag("settings-instructions")
  const instructions = await getInstructions()
  return <InstructionSettings inst={instructions} />
}

export default async function SettingsCategory({
  params,
}: PageProps<"/settings/[category]">) {
  const category = (await params).category

  switch (category) {
    case "profile":
      return <Profile />

    case "instructions":
      return <Instructions />

    default:
      return notFound()
  }
}
