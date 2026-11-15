import { defineTable } from "convex/server"
import { v } from "convex/values"
import { roleValidator } from "../lib/validators"

export const users = defineTable({
  tokenIdentifier: v.string(),
  clerkId: v.string(),
  email: v.string(),
  name: v.string(),
  imageUrl: v.optional(v.string()),
  role: roleValidator,
  trustedLender: v.boolean(),
})
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"])
