import { getInstructions } from "@/app/actions/settings/instruction"
import { getProfile } from "@/app/actions/settings/profile"
import Loading from "@/app/loading"
import { InstructionSettings } from "@/components/settings/instruction"
import { ProfileSettings } from "@/components/settings/profile"
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
    case "profile":
      return (
        <Suspense fallback={<Loading />}>
          <Profile />
        </Suspense>
      )

    case "instructions":
      return (
        <Suspense fallback={<Loading />}>
          <Instructions />
        </Suspense>
      )

    default:
      return notFound()
  }
}
