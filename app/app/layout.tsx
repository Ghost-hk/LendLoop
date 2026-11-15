import type { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server"
import { AppShell } from "@/components/layout/app-shell"

export default async function AppLayout({ children }: { children: ReactNode }) {
  await auth.protect()
  return <AppShell>{children}</AppShell>
}
