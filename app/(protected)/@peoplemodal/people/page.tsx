// import { Badge } from "@/components/ui/badge"
import { SettingsHeader } from "@/components/header"
import { getPeople } from "@/app/actions/people"
import { PeopleListSkeleton, PeopleSearch } from "@/components/people"
import { Suspense } from "react"

async function People() {
  const people = await getPeople()
  return <PeopleSearch data={people.data} />
}

// async function PeopleCount() {
//   const count = await getAvailablePersonaCount()
//   return (
//     <Badge variant="outline" className="px-4 py-2">
//       {count} People
//     </Badge>
//   )
// }

export default async function PeoplePage() {
  return (
    <SettingsHeader page="People">
      <Suspense fallback={<PeopleListSkeleton count={4} />}>
        <People />
      </Suspense>
    </SettingsHeader>
  )
}
