import { HangTag } from "@/components/tools/hang-tag"
import { daysBetween, formatDay, isoToday } from "@/lib/dates"
import type { LoanView } from "./types"

export function LoanStatusTag({ loan, perspective }: { loan: LoanView; perspective: "borrower" | "lender" | "admin" }) {
  const today = isoToday()
  switch (loan.status) {
    case "requested":
      return <HangTag variant="pending">{perspective === "lender" ? "Needs your answer" : "Waiting for answer"}</HangTag>
    case "approved": {
      if (loan.isOverdue) {
        const late = daysBetween(loan.endDate, today)
        return <HangTag variant="overdue">Overdue {late === 1 ? "1 day" : `${late} days`}</HangTag>
      }
      if (loan.startDate > today) return <HangTag variant="yours">Approved · from {formatDay(loan.startDate)}</HangTag>
      return <HangTag variant="out">Out · due {formatDay(loan.endDate)}</HangTag>
    }
    case "returned":
      return <HangTag variant="done">Returned</HangTag>
    case "declined":
      return <HangTag variant="done">Declined</HangTag>
    case "cancelled":
      return <HangTag variant="done">Cancelled</HangTag>
  }
}
