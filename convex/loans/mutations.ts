import { v } from "convex/values"
import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"
import { recordLoanEvent } from "../automation/events"
import { userMutation } from "../lib/functions"
import { requireLoanParty } from "../lib/access"
import { appError } from "../lib/errors"
import { cleanText } from "../lib/input"
import { enforceRateLimit } from "../lib/rateLimits"
import { rangesOverlap, today, validateLoanDates } from "../lib/dates"
import { LIMITS, type LoanStatus } from "../lib/validators"
import { declineLoan, findApprovedOverlap, pendingLoansForTool } from "./helpers"

function requireStatus(loan: Doc<"loans">, expected: LoanStatus) {
  if (loan.status !== expected) {
    throw appError("CONFLICT", `This request is already ${loan.status}.`)
  }
}

async function transition(
  ctx: MutationCtx,
  loan: Doc<"loans">,
  patch: Partial<Doc<"loans">> & { status: Exclude<LoanStatus, "requested"> },
) {
  await ctx.db.patch("loans", loan._id, patch)
  const updated = { ...loan, ...patch }
  await recordLoanEvent(ctx, updated, patch.status)
  return updated
}

export const request = userMutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.string(),
    endDate: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { toolId, startDate, endDate, note }) => {
    const tool = await ctx.db.get("tools", toolId)
    if (!tool || tool.removedAt !== undefined) throw appError("NOT_FOUND", "Tool not found.")
    if (tool.ownerId === ctx.user._id) throw appError("INVALID", "You can't borrow your own tool.")

    validateLoanDates(startDate, endDate)

    if (await findApprovedOverlap(ctx, toolId, { startDate, endDate })) {
      throw appError("CONFLICT", "The tool is already booked for some of those dates.")
    }

    const alreadyPending = (await pendingLoansForTool(ctx, toolId)).some(
      (loan) => loan.borrowerId === ctx.user._id,
    )
    if (alreadyPending) {
      throw appError("CONFLICT", "You already have a pending request for this tool.")
    }

    await enforceRateLimit(ctx, "loanRequest", ctx.user._id)

    const cleanedNote = note ? cleanText(note, "Note", { max: LIMITS.loanNote, required: false }) : ""

    const loanId: Id<"loans"> = await ctx.db.insert("loans", {
      toolId,
      borrowerId: ctx.user._id,
      lenderId: tool.ownerId,
      startDate,
      endDate,
      status: "requested",
      note: cleanedNote || undefined,
    })
    await recordLoanEvent(ctx, (await ctx.db.get("loans", loanId))!, "requested")
    return loanId
  },
})

export const approve = userMutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const loan = await requireLoanParty(ctx, loanId, "lender")
    requireStatus(loan, "requested")

    const tool = await ctx.db.get("tools", loan.toolId)
    if (!tool || tool.removedAt !== undefined) throw appError("CONFLICT", "This tool was removed.")
    if (loan.endDate < today()) throw appError("CONFLICT", "The requested dates have already passed.")
    if (await findApprovedOverlap(ctx, loan.toolId, loan)) {
      throw appError("CONFLICT", "You already approved another loan for those dates.")
    }

    await transition(ctx, loan, { status: "approved", decidedAt: Date.now() })

    const competing = (await pendingLoansForTool(ctx, loan.toolId)).filter((other) =>
      rangesOverlap(other, loan),
    )
    for (const other of competing) await declineLoan(ctx, other)
  },
})

export const decline = userMutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const loan = await requireLoanParty(ctx, loanId, "lender")
    requireStatus(loan, "requested")
    await declineLoan(ctx, loan)
  },
})

export const cancel = userMutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const loan = await requireLoanParty(ctx, loanId, "borrower")
    requireStatus(loan, "requested")
    await transition(ctx, loan, { status: "cancelled", decidedAt: Date.now() })
  },
})

export const markReturned = userMutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const loan = await requireLoanParty(ctx, loanId, "lender")
    requireStatus(loan, "approved")
    await transition(ctx, loan, { status: "returned", returnedAt: Date.now() })
  },
})
