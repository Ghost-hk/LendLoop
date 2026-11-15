"use client"

import { useMutation, useQuery } from "convex/react"
import { Check, Inbox, PackageCheck, X } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { PageHeader } from "@/components/layout/page-header"
import { LoanRow } from "@/components/loans/loan-row"
import { EmptyState } from "@/components/states/empty-state"
import { Section } from "@/components/states/section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRunMutation } from "@/hooks/use-run-mutation"

export default function IncomingPage() {
  const loans = useQuery(api.loans.queries.incoming)
  const approve = useMutation(api.loans.mutations.approve)
  const decline = useMutation(api.loans.mutations.decline)
  const markReturned = useMutation(api.loans.mutations.markReturned)
  const { run, pending } = useRunMutation()

  const waiting = loans?.filter((l) => l.status === "requested") ?? []
  const out = (loans?.filter((l) => l.status === "approved") ?? []).sort((a, b) =>
    a.endDate.localeCompare(b.endDate),
  )
  const history = loans?.filter((l) => l.status !== "requested" && l.status !== "approved") ?? []

  return (
    <>
      <PageHeader title="Incoming" description="Requests for your tools and the loans you're waiting on." />
      {loans === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing waiting on you"
          description="When a neighbor asks to borrow one of your tools, it shows up here and you get an email."
        />
      ) : (
        <>
          <Section title="Needs your answer" count={waiting.length}>
            {waiting.length === 0 ? (
              <p className="text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {waiting.map((loan) => (
                  <LoanRow
                    key={loan._id}
                    loan={loan}
                    perspective="lender"
                    actions={
                      <>
                        <Button
                          variant="outline"
                          disabled={pending}
                          onClick={() => run(() => decline({ loanId: loan._id }), "Request declined")}
                        >
                          <X aria-hidden />
                          Decline
                        </Button>
                        <Button
                          variant="accent"
                          disabled={pending}
                          onClick={() => run(() => approve({ loanId: loan._id }), "Approved. The borrower gets an email.")}
                        >
                          <Check aria-hidden />
                          Approve
                        </Button>
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </Section>

          {out.length > 0 && (
            <Section title="Out on loan" count={out.length}>
              <ul className="space-y-3">
                {out.map((loan) => (
                  <LoanRow
                    key={loan._id}
                    loan={loan}
                    perspective="lender"
                    actions={
                      <Button
                        variant={loan.isOverdue ? "default" : "outline"}
                        disabled={pending}
                        onClick={() => run(() => markReturned({ loanId: loan._id }), "Marked as returned")}
                      >
                        <PackageCheck aria-hidden />
                        Mark returned
                      </Button>
                    }
                  />
                ))}
              </ul>
            </Section>
          )}

          {history.length > 0 && (
            <Section title="History" count={history.length}>
              <ul className="space-y-3">
                {history.map((loan) => (
                  <LoanRow key={loan._id} loan={loan} perspective="lender" />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </>
  )
}
