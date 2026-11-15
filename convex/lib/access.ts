import type { QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import { appError } from "./errors"

type AuthedCtx = QueryCtx & { user: Doc<"users"> }

export async function requireToolOwner(ctx: AuthedCtx, toolId: Id<"tools">) {
  const tool = await ctx.db.get("tools", toolId)
  if (!tool || tool.removedAt !== undefined || tool.ownerId !== ctx.user._id) {
    throw appError("NOT_FOUND", "Tool not found.")
  }
  return tool
}

export async function requireLoanParty(
  ctx: AuthedCtx,
  loanId: Id<"loans">,
  party: "lender" | "borrower",
) {
  const loan = await ctx.db.get("loans", loanId)
  const partyId = party === "lender" ? loan?.lenderId : loan?.borrowerId
  if (!loan || partyId !== ctx.user._id) {
    throw appError("NOT_FOUND", "Loan not found.")
  }
  return loan
}
