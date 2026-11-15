"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Menu } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { AppNav } from "./app-nav"
import { Wordmark } from "./wordmark"

function useShellData() {
  const me = useQuery(api.users.queries.current)
  const incoming = useQuery(api.loans.queries.incoming, me ? {} : "skip")
  const incomingCount = incoming?.filter((loan) => loan.status === "requested").length ?? 0
  return { me, incomingCount }
}

function UserCard({ name, trusted }: { name: string; trusted: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2">
      <UserButton />
      <div className="min-w-0 text-sm">
        <p className="truncate font-semibold text-paper">{name}</p>
        {trusted && <p className="text-safety">Trusted Lender</p>}
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { me, incomingCount } = useShellData()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = me?.role === "admin"

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col gap-8 bg-sidebar px-4 py-6 lg:flex">
        <Wordmark href="/app" className="px-3" />
        <AppNav isAdmin={isAdmin} incomingCount={incomingCount} />
        <div className="mt-auto">{me && <UserCard name={me.name} trusted={me.trustedLender} />}</div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        <Wordmark href="/app" className="text-2xl" />
        <div className="flex items-center gap-2">
          <UserButton />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-paper hover:bg-sidebar-accent hover:text-paper" />
              }
            >
              <Menu aria-hidden />
              <span className="sr-only">Open menu</span>
              {incomingCount > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-tag-red" />}
            </SheetTrigger>
            <SheetContent side="left" className="border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Wordmark href="/app" className="mb-6 px-3" />
              <AppNav isAdmin={isAdmin} incomingCount={incomingCount} onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:py-10">
        {me ? children : <ShellLoading />}
      </main>
    </div>
  )
}

function ShellLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
