import { SignIn } from "@clerk/nextjs"
import { Wordmark } from "@/components/layout/wordmark"

export default function SignInPage() {
  return (
    <main className="pegboard flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Wordmark className="rounded-md bg-ink px-4 py-2 text-3xl" />
      <SignIn />
    </main>
  )
}
