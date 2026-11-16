import { v } from "convex/values"
import { internalMutation, internalQuery } from "../_generated/server"
import { internal } from "../_generated/api"

export const RETRY_DELAYS_MS = [5 * 60_000, 10 * 60_000, 30 * 60_000]

export const loadDelivery = internalQuery({
  args: { deliveryId: v.id("webhookDeliveries") },
  handler: async (ctx, { deliveryId }) => {
    const delivery = await ctx.db.get("webhookDeliveries", deliveryId)
    if (!delivery || delivery.status !== "pending") return null

    const loan = await ctx.db.get("loans", delivery.loanId)
    const recipient = await ctx.db.get("users", delivery.recipientId)
    if (!loan || !recipient) return null
    const tool = await ctx.db.get("tools", loan.toolId)

    return {
      event: delivery.event,
      deliveryId: delivery._id,
      loanId: loan._id,
      occurredAt: new Date(delivery._creationTime).toISOString(),
      recipient: { email: recipient.email, firstName: recipient.name.split(/\s+/)[0] || "Neighbor" },
      toolName: tool?.name ?? "a tool",
      startDate: loan.startDate,
      endDate: loan.endDate,
    }
  },
})

export const markSent = internalMutation({
  args: { deliveryId: v.id("webhookDeliveries"), statusCode: v.number() },
  handler: async (ctx, { deliveryId, statusCode }) => {
    const delivery = await ctx.db.get("webhookDeliveries", deliveryId)
    if (!delivery || delivery.status !== "pending") return
    await ctx.db.patch("webhookDeliveries", deliveryId, {
      status: "sent",
      attempts: delivery.attempts + 1,
      lastStatusCode: statusCode,
      lastError: undefined,
      sentAt: Date.now(),
    })
  },
})

export const recordFailure = internalMutation({
  args: {
    deliveryId: v.id("webhookDeliveries"),
    error: v.string(),
    statusCode: v.optional(v.number()),
    retryable: v.boolean(),
  },
  handler: async (ctx, { deliveryId, error, statusCode, retryable }) => {
    const delivery = await ctx.db.get("webhookDeliveries", deliveryId)
    if (!delivery || delivery.status !== "pending") return

    const attempts = delivery.attempts + 1
    const delay = retryable ? RETRY_DELAYS_MS[attempts - 1] : undefined

    if (delay === undefined) {
      await ctx.db.patch("webhookDeliveries", deliveryId, {
        status: "failed",
        attempts,
        lastError: error,
        lastStatusCode: statusCode,
        failedAt: Date.now(),
      })
      return
    }

    await ctx.db.patch("webhookDeliveries", deliveryId, { attempts, lastError: error, lastStatusCode: statusCode })
    await ctx.scheduler.runAfter(delay, internal.automation.actions.send, { deliveryId })
  },
})

export const dropUnsendable = internalMutation({
  args: { deliveryId: v.id("webhookDeliveries") },
  handler: async (ctx, { deliveryId }) => {
    const delivery = await ctx.db.get("webhookDeliveries", deliveryId)
    if (!delivery || delivery.status !== "pending") return
    await ctx.db.patch("webhookDeliveries", deliveryId, {
      status: "failed",
      lastError: "Loan or recipient no longer exists.",
      failedAt: Date.now(),
    })
  },
})
