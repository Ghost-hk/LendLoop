"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoanRow } from "@/components/loans/loan-row"
import type { LoanView } from "@/components/loans/types"
import { Section } from "@/components/states/section"
import { Skeleton } from "@/components/ui/skeleton"
import { isoToday } from "@/lib/dates"

function group(loans: LoanView[]) {
  const today = isoToday()
  return [
    { title: "Overdue", loans: loans.filter((l) => l.isOverdue) },
    { title: "Waiting for answer", loans: loans.filter((l) => l.status === "requested") },
    { title: "Out now", loans: loans.filter((l) => l.status === "approved" && !l.isOverdue && l.startDate <= today) },
    { title: "Approved, upcoming", loans: loans.filter((l) => l.status === "approved" && l.startDate > today) },
    { title: "Closed", loans: loans.filter((l) => ["declined", "cancelled", "returned"].includes(l.status)) },
  ].filter((g) => g.loans.length > 0)
}

export function AdminLoans() {
  const loans = useQuery(api.admin.queries.allLoans)
  if (loans === undefined) return <Skeleton className="h-40 rounded-xl" />
  if (loans.length === 0) return <p className="text-muted-foreground">No loans yet.</p>
  return (
    <>
      {group(loans).map((g) => (
        <Section key={g.title} title={g.title} count={g.loans.length}>
          <ul className="space-y-3">
            {g.loans.map((loan) => (
              <LoanRow key={loan._id} loan={loan} perspective="admin" />
            ))}
          </ul>
        </Section>
      ))}
    </>
  )
}
