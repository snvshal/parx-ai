import { getInstructions } from "@/app/actions/settings/instruction"
import { getProfile } from "@/app/actions/settings/profile"
import { InstructionSettings } from "@/components/settings/instruction"
import { ProfileSettings } from "@/components/settings/profile"
import { notFound } from "next/navigation"

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
      const inst = await getInstructions()
      return <InstructionSettings inst={JSON.parse(JSON.stringify(inst))} />
    }

    default:
      return notFound()
  }
}
