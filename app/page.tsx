import Link from "next/link"
import { connection } from "next/server"
import { Show, SignInButton } from "@clerk/nextjs"
import { fetchQuery } from "convex/nextjs"
import { ArrowRight } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Wordmark } from "@/components/layout/wordmark"
import { PublicWall } from "@/components/tools/public-wall"
import { Button } from "@/components/ui/button"

const PUBLIC_LIMIT = 9

const STEPS = [
  {
    title: "Hang what you rarely use",
    body: "List a tool in under a minute. You approve every request, so nothing leaves without a yes from you.",
  },
  {
    title: "Ask for the days you need",
    body: "Pick dates on the wall. Neighbors see your name and nothing else. No emails, no phone numbers.",
  },
  {
    title: "Reminders do the chasing",
    body: "Everyone gets an email when a request changes, and late returns get a friendly daily reminder.",
  },
]

function SignInCta({ size = "lg", label = "Sign in to lend or borrow" }: { size?: "lg" | "default"; label?: string }) {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal" forceRedirectUrl="/app">
          <Button variant="accent" size={size}>
            {label}
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Button variant="accent" size={size} nativeButton={false} render={<Link href="/app" />}>
          Open the tool wall
          <ArrowRight aria-hidden />
        </Button>
      </Show>
    </>
  )
}

export default async function HomePage() {
  await connection()
  const tools = await fetchQuery(api.tools.queries.publicList)
  const shown = tools.slice(0, PUBLIC_LIMIT)

  return (
    <div className="min-h-svh">
      <header className="bg-ink">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Wordmark />
          <SignInCta size="default" label="Sign in" />
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div className="space-y-7">
            <h1 className="font-title text-6xl text-balance sm:text-7xl lg:text-8xl">
              Borrow what you need. Lend what you don&apos;t.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              LendLoop is your neighborhood&apos;s shared tool wall. Hang the drill you use twice a year, borrow the
              ladder you need this weekend, and let the reminders handle the awkward part.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <SignInCta />
              <a href="#how-it-works" className="font-semibold underline decoration-2 underline-offset-4">
                How it works
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-title text-2xl">On the wall right now</h2>
              <p className="text-sm text-muted-foreground tabular">
                {tools.length} {tools.length === 1 ? "tool" : "tools"} available
              </p>
            </div>
            <PublicWall tools={shown} />
            {tools.length > PUBLIC_LIMIT && (
              <p className="text-sm text-muted-foreground">
                And {tools.length - PUBLIC_LIMIT} more once you sign in.
              </p>
            )}
          </div>
        </section>

        <section id="how-it-works" className="bg-ink text-paper">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
            <h2 className="mb-10 font-title text-4xl text-safety sm:text-5xl">How it works</h2>
            <ol className="grid gap-10 md:grid-cols-3">
              {STEPS.map(({ title, body }) => (
                <li key={title} className="space-y-3 border-t-2 border-safety pt-5">
                  <h3 className="font-title text-3xl">{title}</h3>
                  <p className="max-w-sm text-[#d6cfc0]">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>LendLoop · a neighborhood tool-lending board</p>
        <p>Public visitors see tool names and categories only.</p>
      </footer>
    </div>
  )
}
