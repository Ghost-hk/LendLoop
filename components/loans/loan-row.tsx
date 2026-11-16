import { Quote } from "lucide-react"
import { ToolGlyph } from "@/components/tools/tool-glyph"
import { TrustedMark } from "@/components/tools/trusted-mark"
import { formatRange, isoToday, loanLength } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { LoanActivity } from "./loan-activity"
import { LoanStatusTag } from "./loan-status-tag"
import type { LoanView } from "./types"

type Perspective = "borrower" | "lender" | "admin"

function Party({ party }: { party?: { name: string; trustedLender: boolean } }) {
  if (!party) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="font-semibold text-ink">{party.name}</span>
      {party.trustedLender && <TrustedMark />}
    </span>
  )
}

function Who({ loan, perspective }: { loan: LoanView; perspective: Perspective }) {
  if (perspective === "borrower") {
    return (
      <>
        Lent by <Party party={loan.lender} />
      </>
    )
  }
  if (perspective === "lender") {
    return (
      <>
        Borrower <Party party={loan.borrower} />
      </>
    )
  }
  return (
    <>
      <Party party={loan.borrower} /> from <Party party={loan.lender} />
    </>
  )
}

export function LoanRow({
  loan,
  perspective,
  actions,
}: {
  loan: LoanView
  perspective: Perspective
  actions?: React.ReactNode
}) {
  const closed = loan.status === "declined" || loan.status === "cancelled" || loan.status === "returned"
  return (
    <li className={cn("rounded-xl border bg-card p-4", closed && "bg-transparent")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {loan.tool.category ? (
            <ToolGlyph category={loan.tool.category} name={loan.tool.name} out={loan.status === "approved" && loan.startDate <= isoToday()} size="sm" />
          ) : null}
          <div className="min-w-0 space-y-1">
            <h3 className="font-title text-2xl">
              {loan.tool.name}
              {loan.tool.removed && <span className="ml-2 align-middle text-sm text-muted-foreground normal-case">(no longer listed)</span>}
            </h3>
            <p className="text-sm text-muted-foreground">
              <Who loan={loan} perspective={perspective} />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <p className="font-semibold tabular md:min-w-44 md:text-right">
            {formatRange(loan.startDate, loan.endDate)}
            <span className="block text-sm font-normal text-muted-foreground">{loanLength(loan.startDate, loan.endDate)}</span>
          </p>
          <LoanStatusTag loan={loan} perspective={perspective} />
        </div>
      </div>
      {loan.note && perspective !== "borrower" && (
        <p className="mt-3 flex gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
          <Quote aria-hidden size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span>{loan.note}</span>
        </p>
      )}
      {actions && <div className="mt-4 flex flex-wrap justify-end gap-2">{actions}</div>}
      <LoanActivity activity={loan.activity} />
    </li>
  )
}
