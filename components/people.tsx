"use client"

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { TPersona } from "@/app/actions/people"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "./ui/input"
import { Skeleton } from "./ui/skeleton"
import { ScrollArea } from "./ui/scroll-area"

export type SearchResult = {
  success: boolean
  data: TPersona[]
}

export function PeopleSearch({ data }: { data: TPersona[] }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TPersona[]>(data)
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const placeholder = useMemo(() => "Search people by name or username...", [])

  const doSearch = useCallback(
    (q: string) => {
      setLoading(true)
      const lower = q.trim().toLowerCase()

      const filtered = data.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.username.toLowerCase().includes(lower),
      )

      startTransition(() => setResults(filtered))
      setLoading(false)
    },
    [data],
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  return (
    <div className="relative">
      <div className="bg-background sticky top-0 z-20 py-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="bg-background w-full rounded-lg border px-4 py-2 text-sm"
        />
      </div>

      <ScrollArea className="h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-12rem)]">
        {loading && <PeopleListSkeleton count={4} />}

        {!loading && results.length === 0 && (
          <div className="text-muted-foreground py-24 text-center">
            No people found.
          </div>
        )}

        {!loading && results.length > 0 && <People people={results} />}
      </ScrollArea>
    </div>
  )
}

export function People({ people }: { people: TPersona[] }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col">
        {people.map((persona: TPersona) => (
          <Link key={persona.id} href={`/m/${persona.username}`}>
            <Card className="group relative rounded-none border-0 border-b transition-all">
              <div className="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 z-10 transition-colors duration-300" />
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
                    <p className="text-muted-foreground text-sm">
                      @{persona.username}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="my-3 wrap-break-word">{persona.firstMessage}</p>
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

function InstructionBadge({
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

export function PeopleListSkeleton({ count }: { count?: number }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:gap-4">
        {[...Array(count)].map((_, i) => (
          <Link key={i} href="#" className="block">
            <Card className="group relative rounded-none border-0 border-b transition-all">
              <div className="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 z-10 transition-colors duration-300" />
              <CardHeader>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>
                      <Skeleton className="h-full w-full rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-2 py-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-32 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
