import { userQuery } from "../lib/functions"
import { createLoanViewer } from "./helpers"

export const myRequests = userQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", ctx.user._id))
      .order("desc")
      .collect()
    const view = createLoanViewer(ctx, "borrower")
    return await Promise.all(loans.map(view))
  },
})

export const incoming = userQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_lender", (q) => q.eq("lenderId", ctx.user._id))
      .order("desc")
      .collect()
    const view = createLoanViewer(ctx, "lender")
    return await Promise.all(loans.map(view))
  },
})
