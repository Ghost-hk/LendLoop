"use client"

import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { ClipboardList } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { PageHeader } from "@/components/layout/page-header"
import { LoanRow } from "@/components/loans/loan-row"
import { EmptyState } from "@/components/states/empty-state"
import { Section } from "@/components/states/section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRunMutation } from "@/hooks/use-run-mutation"

export default function MyRequestsPage() {
  const loans = useQuery(api.loans.queries.myRequests)
  const cancel = useMutation(api.loans.mutations.cancel)
  const { run, pending } = useRunMutation()

  const active = loans?.filter((l) => l.status === "requested" || l.status === "approved") ?? []
  const history = loans?.filter((l) => l.status !== "requested" && l.status !== "approved") ?? []

  return (
    <>
      <PageHeader title="My requests" description="Things you've asked to borrow, and where each one stands." />
      {loans === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requests yet"
          description="Find something on the tool wall and ask for the days you need it."
          action={<Button variant="accent" nativeButton={false} render={<Link href="/app" />}>Go to the tool wall</Button>}
        />
      ) : (
        <>
          <Section title="Current" count={active.length}>
            {active.length === 0 ? (
              <p className="text-muted-foreground">Nothing pending or borrowed right now.</p>
            ) : (
              <ul className="space-y-3">
                {active.map((loan) => (
                  <LoanRow
                    key={loan._id}
                    loan={loan}
                    perspective="borrower"
                    actions={
                      loan.status === "requested" ? (
                        <Button
                          variant="outline"
                          disabled={pending}
                          onClick={() => run(() => cancel({ loanId: loan._id }), "Request cancelled")}
                        >
                          Cancel request
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
              </ul>
            )}
          </Section>
          {history.length > 0 && (
            <Section title="History" count={history.length}>
              <ul className="space-y-3">
                {history.map((loan) => (
                  <LoanRow key={loan._id} loan={loan} perspective="borrower" />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </>
  )
}
