import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getPeople, TPersona, TPersonaResponse } from "../actions/people"
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
      className="max-sm:p-0"
    >
      <Suspense fallback={<ChatListSkeleton count={4} />}>
        <PeopleList peoplePromise={peoplePromise} />
      </Suspense>
    </HeaderComponent>
  )
}

async function PeopleCount({
  peoplePromise,
}: {
  peoplePromise: Promise<TPersonaResponse>
}) {
  const res = await peoplePromise
  const people = res.success ? res.data : []
  return (
    <Badge variant="outline" className="px-4 py-1">
      {people.length} Available
    </Badge>
  )
}

async function PeopleList({
  peoplePromise,
}: {
  peoplePromise: Promise<TPersonaResponse>
}) {
  const res = await peoplePromise
  const people: TPersona[] = res.success ? res.data : []

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:gap-4 sm:p-4">
        {people.map((person: TPersona) => (
          <Link key={person.id} href={`/m/${person.username}`}>
            <Card className="group relative transition-all max-sm:rounded-none max-sm:border-0 max-sm:border-b sm:hover:shadow-[0_0_10px_#3b82f6]">
              <div className="absolute inset-0 z-10 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10 sm:hidden" />
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex gap-4">
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
                </div>
                <Badge variant="secondary" className="px-2 py-1">
                  {person.chatCount || 0}{" "}
                  {person.chatCount === 1 ? "chat" : "chats"}
                </Badge>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
