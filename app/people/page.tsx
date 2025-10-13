import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { TUser } from "@/schemas/user.schema"
import { HeaderComponent } from "@/components/header"
import { getPeople } from "../actions/people"

export function PeopleList({ people }: { people: TUser[] }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        {/* <div className="flex items-center justify-between px-4">
          <h1 className="text-xl md:text-3xl font-bold">AI Companions</h1>
          <Badge variant="outline" className="px-4 py-1">
            {people?.length} Available
          </Badge>
        </div> */}

        {/* <ScrollArea className="flex-1"> */}
        <div className="flex flex-col gap-4">
          {people?.map((person: TUser) => (
            <Link key={person.id} href={`/m/${person.username}`}>
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
                {/* <CardContent>
                    {person.instructions?.length ? (
                      person.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          <p>{instruction.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No instructions provided.
                      </p>
                    )}
                  </CardContent> */}
              </Card>
            </Link>
          ))}
        </div>
        {/* </ScrollArea> */}
      </div>
    </div>
  )
}

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
      <PeopleList people={people} />
    </HeaderComponent>
  )
}
