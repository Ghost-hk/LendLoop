import { v } from "convex/values"
import { query } from "../_generated/server"
import type { QueryCtx } from "../_generated/server"
import type { Category } from "../lib/validators"
import { categoryValidator } from "../lib/validators"
import { userQuery } from "../lib/functions"
import { pendingLoansForTool } from "../loans/helpers"
import { getAvailability } from "./helpers"

const MAX_RESULTS = 200

async function activeTools(ctx: QueryCtx, category?: Category) {
  return await ctx.db
    .query("tools")
    .withIndex("by_active_category", (q) =>
      category ? q.eq("removedAt", undefined).eq("category", category) : q.eq("removedAt", undefined),
    )
    .order("desc")
    .take(MAX_RESULTS)
}

export const publicList = query({
  args: {},
  handler: async (ctx) => {
    const tools = await activeTools(ctx)
    const withAvailability = await Promise.all(
      tools.map(async (tool) => ({ tool, ...(await getAvailability(ctx, tool._id)) })),
    )
    return withAvailability
      .filter(({ availability }) => availability === "available")
      .map(({ tool }) => ({ name: tool.name, category: tool.category }))
  },
})

export const list = userQuery({
  args: { category: v.optional(categoryValidator) },
  handler: async (ctx, { category }) => {
    const tools = await activeTools(ctx, category)

    const myPending = await ctx.db
      .query("loans")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", ctx.user._id))
      .filter((q) => q.eq(q.field("status"), "requested"))
      .collect()
    const pendingToolIds = new Set(myPending.map((loan) => loan.toolId))

    const owners = new Map<string, { name: string; trustedLender: boolean }>()
    const ownerOf = async (ownerId: (typeof tools)[number]["ownerId"]) => {
      if (!owners.has(ownerId)) {
        const owner = await ctx.db.get("users", ownerId)
        owners.set(ownerId, {
          name: owner?.name ?? "Former member",
          trustedLender: owner?.trustedLender ?? false,
        })
      }
      return owners.get(ownerId)!
    }

    return await Promise.all(
      tools.map(async (tool) => ({
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
        owner: await ownerOf(tool.ownerId),
        isMine: tool.ownerId === ctx.user._id,
        hasPendingRequest: pendingToolIds.has(tool._id),
        ...(await getAvailability(ctx, tool._id)),
      })),
    )
  },
})

export const mine = userQuery({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", ctx.user._id))
      .order("desc")
      .collect()

    return await Promise.all(
      tools
        .filter((tool) => tool.removedAt === undefined)
        .map(async (tool) => ({
          _id: tool._id,
          name: tool.name,
          category: tool.category,
          condition: tool.condition,
          description: tool.description,
          pendingCount: (await pendingLoansForTool(ctx, tool._id)).length,
          ...(await getAvailability(ctx, tool._id)),
        })),
    )
  },
})
