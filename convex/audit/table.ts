import { defineTable } from "convex/server"
import { v } from "convex/values"
import { auditActionValidator } from "../lib/validators"

export const auditLog = defineTable({
  actorId: v.optional(v.id("users")),
  action: auditActionValidator,
  toolId: v.optional(v.id("tools")),
  subjectUserId: v.optional(v.id("users")),
  detail: v.optional(v.string()),
})
