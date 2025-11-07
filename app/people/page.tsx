import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getAvailablePersonaCount, getPeople } from "../actions/people"
import { PeopleSearch } from "@/components/people"

export default async function PeoplePage() {
  const people = await getPeople()
  return (
    <HeaderComponent
      page="People"
      actionItem={<PeopleCount />}
      className="pt-0 max-sm:p-0"
    >
      <PeopleSearch data={people.data} />
    </HeaderComponent>
  )
}

async function PeopleCount() {
  const count = await getAvailablePersonaCount()
  return (
    <Badge variant="outline" className="px-4 py-1">
      {count} Available
    </Badge>
  )
}
