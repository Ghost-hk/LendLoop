"use client"

import { useQuery } from "convex/react"
import { ShieldOff } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { AdminAuditLog } from "@/components/admin/admin-audit-log"
import { AdminListings } from "@/components/admin/admin-listings"
import { AdminLoans } from "@/components/admin/admin-loans"
import { AdminNeighbors } from "@/components/admin/admin-neighbors"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/states/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "loans", label: "Loans", content: <AdminLoans /> },
  { value: "listings", label: "Listings", content: <AdminListings /> },
  { value: "neighbors", label: "Neighbors", content: <AdminNeighbors /> },
  { value: "audit", label: "Audit log", content: <AdminAuditLog /> },
]

export default function AdminPage() {
  const me = useQuery(api.users.queries.current)
  if (me && me.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Admins only"
        description="This area is for neighborhood admins. Ask an admin if you think you should have access."
      />
    )
  }

  return (
    <>
      <PageHeader title="Admin" description="Every loan, every listing, and who's trusted. Every change here is logged." />
      <Tabs defaultValue="loans">
        <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-9 flex-none rounded-full border-input bg-card px-4 font-semibold text-ink hover:border-ink data-active:border-ink data-active:bg-ink data-active:text-paper data-active:shadow-none after:hidden"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
