import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const roles = v.union(v.literal("user"), v.literal("admin"))

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: roles,
    trustedLender: v.boolean(),
  }).index("by_token", ["tokenIdentifier"]),
})
