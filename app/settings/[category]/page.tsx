import { getInstructions } from "@/app/actions/settings/instruction"
import { getProfile } from "@/app/actions/settings/profile"
import Loading from "@/app/loading"
import { InstructionSettings } from "@/components/settings/instruction"
import { ProfileSettings } from "@/components/settings/profile"
// import { cacheTag } from "next/cache"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function Profile() {
  // "use cache: private"
  // cacheTag("settings-profile")
  const profile = await getProfile()
  return <ProfileSettings profile={profile} />
}

async function Instructions() {
  // "use cache: private"
  // cacheTag("settings-instructions")
  const instructions = await getInstructions()
  return <InstructionSettings inst={instructions} />
}

export async function generateStaticParams() {
  return [{ category: "profile" }, { category: "instructions" }]
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
