import type { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server"

export default async function AppLayout({ children }: { children: ReactNode }) {
  await auth.protect()
  return children
}
