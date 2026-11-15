import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import { approvedLoansForTool, declineLoan, pendingLoansForTool } from "../loans/helpers"
import { today } from "../lib/dates"

export async function retireTool(ctx: MutationCtx, tool: Doc<"tools">, removedBy: Id<"users">) {
  await ctx.db.patch("tools", tool._id, { removedAt: Date.now(), removedBy })
  for (const loan of await pendingLoansForTool(ctx, tool._id)) {
    await declineLoan(ctx, loan)
  }
}

export async function getAvailability(ctx: QueryCtx, toolId: Id<"tools">) {
  const now = today()
  const upcoming = (await approvedLoansForTool(ctx, toolId))
    .filter((loan) => loan.endDate >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const current = upcoming.find((loan) => loan.startDate <= now)
  return {
    availability: current ? ("on_loan" as const) : ("available" as const),
    bookedRanges: upcoming.map(({ startDate, endDate }) => ({ startDate, endDate })),
  }
}
