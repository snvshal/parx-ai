import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getPeople } from "../actions/people"
import { PeopleList } from "@/components/show/people-list"

export default async function PeoplePage() {
  const res = await getPeople()
  const people = res.success ? res.data : []

  return (
    <HeaderComponent
      page="People"
      actionItem={
        <Badge variant="outline" className="px-4 py-1">
          {people?.length} Available
        </Badge>
      }
    >
      <PeopleList />
    </HeaderComponent>
  )
}
