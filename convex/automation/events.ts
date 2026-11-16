import type { MutationCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"
import { internal } from "../_generated/api"
import type { LoanEvent } from "../lib/validators"

const RECIPIENT: Record<LoanEvent, "lender" | "borrower"> = {
  requested: "lender",
  approved: "borrower",
  declined: "borrower",
  cancelled: "lender",
  returned: "borrower",
}

export async function recordLoanEvent(ctx: MutationCtx, loan: Doc<"loans">, event: LoanEvent) {
  const recipientId = RECIPIENT[event] === "lender" ? loan.lenderId : loan.borrowerId
  const deliveryId = await ctx.db.insert("webhookDeliveries", {
    loanId: loan._id,
    event,
    recipientId,
    status: "pending",
    attempts: 0,
  })
  await ctx.scheduler.runAfter(0, internal.automation.actions.send, { deliveryId })
}
