import { v } from "convex/values"
import { userMutation } from "../lib/functions"
import { requireToolOwner } from "../lib/access"
import { appError } from "../lib/errors"
import { cleanText } from "../lib/input"
import { LIMITS, categoryValidator, conditionValidator } from "../lib/validators"
import { approvedLoansForTool } from "../loans/helpers"
import { retireTool } from "./helpers"

const toolFields = {
  name: v.string(),
  category: categoryValidator,
  condition: conditionValidator,
  description: v.string(),
}

function cleanToolFields(fields: { name: string; description: string }) {
  return {
    name: cleanText(fields.name, "Name", { max: LIMITS.toolName }),
    description: cleanText(fields.description, "Description", {
      max: LIMITS.toolDescription,
      required: false,
    }),
  }
}

export const create = userMutation({
  args: toolFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("tools", {
      ownerId: ctx.user._id,
      category: args.category,
      condition: args.condition,
      ...cleanToolFields(args),
    })
  },
})

export const update = userMutation({
  args: { toolId: v.id("tools"), ...toolFields },
  handler: async (ctx, { toolId, ...args }) => {
    await requireToolOwner(ctx, toolId)
    await ctx.db.patch("tools", toolId, {
      category: args.category,
      condition: args.condition,
      ...cleanToolFields(args),
    })
  },
})

export const remove = userMutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, { toolId }) => {
    const tool = await requireToolOwner(ctx, toolId)
    if ((await approvedLoansForTool(ctx, toolId)).length > 0) {
      throw appError(
        "CONFLICT",
        "This tool has an active or upcoming loan. Mark it returned before removing it.",
      )
    }
    await retireTool(ctx, tool, ctx.user._id)
  },
})
