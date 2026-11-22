import { Suspense } from "react"
import { Metadata } from "next"
import { getPeople } from "@/app/actions/people"
import { PeopleListSkeleton, PeopleSearch } from "@/components/people"
import { HeaderComponent } from "@/components/header"
import { SidebarTrigger } from "@/components/ui/sidebar"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "People",
  description:
    "Discover and chat with custom AI personas created by the community.",
}

async function PeopleList() {
  const people = await getPeople(50)
  return <PeopleSearch data={people.data} />
}

export default async function StandalonePeoplePage() {
  return (
    <HeaderComponent
      page="People"
      backHref="/"
      actionItem={<SidebarTrigger className="z-50" />}
    >
      <Suspense fallback={<PeopleListSkeleton count={6} />}>
        <PeopleList />
      </Suspense>
    </HeaderComponent>
  )
}
