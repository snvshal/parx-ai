import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getAvailablePersonaCount, getPeople } from "@/app/actions/people"
import { PeopleListSkeleton, PeopleSearch } from "@/components/people"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function People() {
  const people = await getPeople()
  return <PeopleSearch data={people.data} />
}

async function PeopleCount() {
  const count = await getAvailablePersonaCount()
  return (
    <Badge variant="outline" className="px-4 py-2">
      {count} People
    </Badge>
  )
}

export default async function PeoplePage() {
  return (
    <HeaderComponent
      page="People"
      actionItem={
        <Suspense
          fallback={
            <Badge variant="outline" className="px-4 py-2">
              <Skeleton className="h-full w-full" />
            </Badge>
          }
        >
          <PeopleCount />
        </Suspense>
      }
      className="pt-0"
    >
      <Suspense fallback={<PeopleListSkeleton count={4} />}>
        <People />
      </Suspense>
    </HeaderComponent>
  )
}
