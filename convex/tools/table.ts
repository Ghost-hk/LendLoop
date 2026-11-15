import { defineTable } from "convex/server"
import { v } from "convex/values"
import { categoryValidator, conditionValidator } from "../lib/validators"

export const tools = defineTable({
  ownerId: v.id("users"),
  name: v.string(),
  category: categoryValidator,
  condition: conditionValidator,
  description: v.string(),
  removedAt: v.optional(v.number()),
  removedBy: v.optional(v.id("users")),
})
  .index("by_owner", ["ownerId"])
  .index("by_category", ["category"])
