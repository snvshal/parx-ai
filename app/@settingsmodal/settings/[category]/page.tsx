import { getInstructions } from "@/app/actions/settings/instruction"
import { getProfile } from "@/app/actions/settings/profile"
import AccountSettings from "@/components/settings/account"
import GeneralSettings from "@/components/settings/general"
import {
  InstructionSettings,
  InstructionSkeleton,
} from "@/components/settings/instruction"
import { ProfileSettings, ProfileSkeleton } from "@/components/settings/profile"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function Profile() {
  const profile = await getProfile()
  return <ProfileSettings profile={profile} />
}

async function Instructions() {
  const instructions = await getInstructions()
  return <InstructionSettings inst={instructions} />
}

export default async function SettingsCategory({
  params,
}: PageProps<"/settings/[category]">) {
  const category = (await params).category

  switch (category) {
    case "general":
      return <GeneralSettings />

    case "profile":
      return (
        <Suspense fallback={<ProfileSkeleton />}>
          <Profile />
        </Suspense>
      )

    case "instructions":
      return (
        <Suspense fallback={<InstructionSkeleton />}>
          <Instructions />
        </Suspense>
      )

    case "account":
      return <AccountSettings />

    default:
      return notFound()
  }
}
