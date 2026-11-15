import type { Id } from "../_generated/dataModel"
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

export const auditLog = adminQuery({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("auditLog").order("desc").take(MAX_RESULTS)
    const names = new Map<string, string>()
    const nameOf = async (id: Id<"users"> | undefined) => {
      if (!id) return null
      if (!names.has(id)) names.set(id, (await ctx.db.get("users", id))?.name ?? "Former member")
      return names.get(id)!
    }
    return await Promise.all(
      entries.map(async (entry) => ({
        _id: entry._id,
        createdAt: entry._creationTime,
        action: entry.action,
        actor: (await nameOf(entry.actorId)) ?? "System",
        subject: await nameOf(entry.subjectUserId),
        detail: entry.detail,
      })),
    )
  },
})
