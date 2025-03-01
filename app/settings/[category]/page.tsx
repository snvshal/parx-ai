import { notFound } from "next/navigation"
import { getInstructions, getProfile, getSessionUser } from "./actions"
import { ProfileSettings, InstructionSettings } from "./components"

export default async function SettingsCategory({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const category = (await params).category

  switch (category) {
    case "profile": {
      const profile = await getProfile()
      return <ProfileSettings profile={profile} />
    }

    case "instructions": {
      const user = await getSessionUser()
      return <InstructionSettings user={JSON.parse(JSON.stringify(user))} />
    }

    default:
      return notFound()
  }
}
