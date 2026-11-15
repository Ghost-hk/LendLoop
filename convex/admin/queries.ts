import { adminQuery } from "../lib/functions"
import { createLoanViewer } from "../loans/helpers"

const MAX_RESULTS = 500

export const allLoans = adminQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db.query("loans").order("desc").take(MAX_RESULTS)
    const view = createLoanViewer(ctx, "admin")
    return await Promise.all(loans.map(view))
  },
})

export const users = adminQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(MAX_RESULTS)
    return await Promise.all(
      users.map(async (user) => {
        const tools = await ctx.db
          .query("tools")
          .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
          .collect()
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          trustedLender: user.trustedLender,
          activeListings: tools.filter((tool) => tool.removedAt === undefined).length,
        }
      }),
    )
  },
})
