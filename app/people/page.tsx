import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getPeople } from "../actions/people"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TUser } from "@/schemas/user.schema"
import { ChatListSkeleton } from "@/components/co"
import Link from "next/link"

export default async function PeoplePage() {
  const peoplePromise = getPeople()

  return (
    <HeaderComponent
      page="People"
      actionItem={
        <Suspense
          fallback={
            <Badge variant="outline" className="px-4 py-1">
              ...
            </Badge>
          }
        >
          <PeopleCount peoplePromise={peoplePromise} />
        </Suspense>
      }
    >
      <Suspense fallback={<ChatListSkeleton count={4} />}>
        <PeopleList peoplePromise={peoplePromise} />
      </Suspense>
    </HeaderComponent>
  )
}

async function PeopleCount({ peoplePromise }: { peoplePromise: Promise<any> }) {
  const res = await peoplePromise
  const people = res.success ? res.data : []
  return (
    <Badge variant="outline" className="px-4 py-1">
      {people.length} Available
    </Badge>
  )
}

async function PeopleList({ peoplePromise }: { peoplePromise: Promise<any> }) {
  const res = await peoplePromise
  const people: TUser[] = res.success ? res.data : []

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {people.map((person: TUser) => (
            <Link key={String(person._id)} href={`/m/${person.username}`}>
              <Card className="transition-shadow hover:shadow-[0_0_10px_#3b82f6]">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>
                      {person.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-sm text-muted-foreground">
                      @{person.username}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
