import { defineTable } from "convex/server"
import { v } from "convex/values"
import {
  automationEventTypeValidator,
  deliveryStatusValidator,
  loanEventValidator,
} from "../lib/validators"

export const webhookDeliveries = defineTable({
  loanId: v.id("loans"),
  event: loanEventValidator,
  recipientId: v.id("users"),
  status: deliveryStatusValidator,
  attempts: v.number(),
  lastError: v.optional(v.string()),
  lastStatusCode: v.optional(v.number()),
  sentAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),
})
  .index("by_loan", ["loanId"])
  .index("by_status", ["status"])

export const automationEvents = defineTable({
  loanId: v.optional(v.id("loans")),
  type: automationEventTypeValidator,
  idempotencyKey: v.string(),
  detail: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_key", ["idempotencyKey"])
  .index("by_loan", ["loanId"])
