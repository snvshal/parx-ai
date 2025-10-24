import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { HeaderComponent } from "@/components/header"
import { getPeople, TPersona, TPersonaResponse } from "../actions/people"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatListSkeleton } from "@/components/co"
import Link from "next/link"

export default async function PeoplePage() {
  const peoplePromise = getPeople({
    lowCount: 1,
    mediumCount: 5,
    highCount: 15,
    greatCount: 25,
    lowTokens: 200,
    mediumTokens: 1000,
    highTokens: 5000,
    greatTokens: 20000,
  })

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
        {people.map((persona: TPersona) => (
          <Link key={persona.id} href={`/m/${persona.username}`}>
            <Card className="group relative rounded-3xl transition-all max-sm:rounded-none max-sm:border-0 max-sm:border-b sm:hover:shadow-[0_0_10px_#3b82f6]">
              <div className="absolute inset-0 z-10 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10 sm:hidden" />
              <CardHeader>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={persona.avatar} alt={persona.name} />
                    <AvatarFallback>
                      {persona.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{persona.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{persona.username}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="my-3 break-all">{persona.firstMessage}</p>
                  <div className="flex items-center gap-4">
                    <InstructionBadge status={persona.instructionStatus} />
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1.5 font-medium"
                    >
                      {persona.chatCount || 0}{" "}
                      {persona.chatCount === 1 ? "chat" : "chats"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function InstructionBadge({
  status,
}: {
  status: TPersona["instructionStatus"]
}) {
  const colorMap: Record<TPersona["instructionStatus"], string> = {
    null: "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 hover:text-gray-900 hover:border-gray-400",
    low: "bg-yellow-200 text-yellow-900 border-yellow-300 hover:bg-yellow-300 hover:text-yellow-950 hover:border-yellow-400",
    medium:
      "bg-blue-200 text-blue-900 border-blue-300 hover:bg-blue-300 hover:text-blue-950 hover:border-blue-400",
    high: "bg-purple-200 text-purple-900 border-purple-300 hover:bg-purple-300 hover:text-purple-950 hover:border-purple-400",
    great:
      "bg-green-200 text-green-900 border-green-300 hover:bg-green-300 hover:text-green-950 hover:border-green-400",
  }

  const labelMap: Record<TPersona["instructionStatus"], string> = {
    null: "No Context",
    low: "Basic Context",
    medium: "Good Context",
    high: "Rich Context",
    great: "Great Context",
  }

  return (
    <Badge
      className={`${colorMap[status]} rounded-full px-3 py-1.5 font-medium transition-colors`}
    >
      {labelMap[status]}
    </Badge>
  )
}
