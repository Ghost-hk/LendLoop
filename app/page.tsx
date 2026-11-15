import Link from "next/link"
import { Show, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">LendLoop</h1>
      <p className="text-muted-foreground">Borrow what you need. Lend what you don&apos;t.</p>
      <div>
        <Show when="signed-out">
          <SignInButton mode="modal" forceRedirectUrl="/app">
            <Button>Sign in to lend or borrow</Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Button render={<Link href="/app" />}>Open LendLoop</Button>
        </Show>
      </div>
    </main>
  )
}
