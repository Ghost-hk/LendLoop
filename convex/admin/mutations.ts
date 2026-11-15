import { v } from "convex/values"
import { adminMutation } from "../lib/functions"
import { appError } from "../lib/errors"
import { retireTool } from "../tools/helpers"

export const removeTool = adminMutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, { toolId }) => {
    const tool = await ctx.db.get("tools", toolId)
    if (!tool || tool.removedAt !== undefined) throw appError("NOT_FOUND", "Tool not found.")
    await retireTool(ctx, tool, ctx.user._id)
  },
})

export const setTrustedLender = adminMutation({
  args: { userId: v.id("users"), trusted: v.boolean() },
  handler: async (ctx, { userId, trusted }) => {
    const user = await ctx.db.get("users", userId)
    if (!user) throw appError("NOT_FOUND", "User not found.")
    await ctx.db.patch("users", userId, { trustedLender: trusted })
  },
})
