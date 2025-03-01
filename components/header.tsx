"use client"

import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeaderComponent({
  page,
  children,
  actionItem,
}: {
  page: string
  children: React.ReactNode
  actionItem?: JSX.Element
}) {
  const router = useRouter()
  return (
    <div>
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex items-center justify-between box-border h-16 px-4 mx-auto max-w-3xl">
          <div className="flex gap-4">
            <button onClick={() => router.back()}>
              <ArrowLeftIcon className="h-7 w-7" aria-hidden={true} />
            </button>
            <p className="text-xl font-bold">{page}</p>
          </div>
          <div>{actionItem}</div>
        </div>
      </header>
      <main className="mx-auto box-border max-w-2xl scroll-smooth px-4 py-6">
        {children}
      </main>
    </div>
  )
}
