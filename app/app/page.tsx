"use client"

import { UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function AppPage() {
  const me = useQuery(api.users.current)

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LendLoop</h1>
        <UserButton />
      </div>
      <pre className="rounded-md bg-muted p-4 text-sm">{JSON.stringify(me, null, 2)}</pre>
    </main>
  )
}
