import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import { loanActivity } from "../automation/activity"
import { recordLoanEvent } from "../automation/events"
import { rangesOverlap, today } from "../lib/dates"

type DateRange = { startDate: string; endDate: string }

export async function approvedLoansForTool(ctx: QueryCtx, toolId: Id<"tools">) {
  return await ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) => q.eq("toolId", toolId).eq("status", "approved"))
    .collect()
}

export async function pendingLoansForTool(ctx: QueryCtx, toolId: Id<"tools">) {
  return await ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) => q.eq("toolId", toolId).eq("status", "requested"))
    .collect()
}

export async function findApprovedOverlap(
  ctx: QueryCtx,
  toolId: Id<"tools">,
  range: DateRange,
) {
  const approved = await approvedLoansForTool(ctx, toolId)
  return approved.find((loan) => rangesOverlap(loan, range)) ?? null
}

export async function declineLoan(ctx: MutationCtx, loan: Doc<"loans">) {
  const updated = { ...loan, status: "declined" as const, decidedAt: Date.now() }
  await ctx.db.patch("loans", loan._id, { status: updated.status, decidedAt: updated.decidedAt })
  await recordLoanEvent(ctx, updated, "declined")
}

export function isOverdue(loan: Doc<"loans">) {
  return loan.status === "approved" && loan.endDate < today()
}

type Perspective = "borrower" | "lender" | "admin"

export function createLoanViewer(ctx: QueryCtx, perspective: Perspective) {
  const users = new Map<Id<"users">, Promise<Doc<"users"> | null>>()
  const tools = new Map<Id<"tools">, Promise<Doc<"tools"> | null>>()

  const getUser = (id: Id<"users">) => {
    if (!users.has(id)) users.set(id, ctx.db.get("users", id))
    return users.get(id)!
  }
  const getTool = (id: Id<"tools">) => {
    if (!tools.has(id)) tools.set(id, ctx.db.get("tools", id))
    return tools.get(id)!
  }
  const nameOf = async (id: Id<"users">) => (await getUser(id))?.name ?? "Former member"
  const party = async (id: Id<"users">) => {
    const user = await getUser(id)
    return { name: user?.name ?? "Former member", trustedLender: user?.trustedLender ?? false }
  }

  return async (loan: Doc<"loans">) => {
    const tool = await getTool(loan.toolId)
    return {
      _id: loan._id,
      createdAt: loan._creationTime,
      status: loan.status,
      startDate: loan.startDate,
      endDate: loan.endDate,
      note: loan.note,
      decidedAt: loan.decidedAt,
      returnedAt: loan.returnedAt,
      isOverdue: isOverdue(loan),
      tool: {
        _id: loan.toolId,
        name: tool?.name ?? "Removed tool",
        category: tool?.category,
        removed: !tool || tool.removedAt !== undefined,
      },
      lender: perspective === "lender" ? undefined : await party(loan.lenderId),
      borrower: perspective === "borrower" ? undefined : await party(loan.borrowerId),
      activity: await loanActivity(ctx, loan, perspective, nameOf),
    }
  }
}
