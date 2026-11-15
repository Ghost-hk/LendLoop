"use client"

import { useEffect, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { api } from "@/convex/_generated/api"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function StoreUser() {
  const { isAuthenticated } = useConvexAuth()
  const store = useMutation(api.users.mutations.store)

  useEffect(() => {
    if (isAuthenticated) void store()
  }, [isAuthenticated, store])

  return null
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <StoreUser />
      {children}
    </ConvexProviderWithClerk>
  )
}
