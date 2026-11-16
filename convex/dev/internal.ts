import { v } from "convex/values"
import { internalMutation } from "../_generated/server"
import { addDays, today } from "../lib/dates"

export const makeOverdue = internalMutation({
  args: { loanId: v.id("loans"), daysOverdue: v.number() },
  handler: async (ctx, { loanId, daysOverdue }) => {
    const endDate = addDays(today(), -daysOverdue)
    await ctx.db.patch("loans", loanId, { startDate: addDays(endDate, -2), endDate })
  },
})
