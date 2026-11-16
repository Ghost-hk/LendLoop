import { adminQuery } from "../lib/functions"

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const MAX_ROWS = 50

export const overview = adminQuery({
  args: {},
  handler: async (ctx) => {
    const since = Date.now() - WINDOW_MS

    const recentDeliveries = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()
    const recentEvents = await ctx.db
      .query("automationEvents")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()

    const stats = {
      notificationsSent: recentDeliveries.filter((d) => d.status === "sent").length,
      notificationsRetrying: recentDeliveries.filter((d) => d.status === "pending" && d.attempts > 0).length,
      notificationsFailed: recentDeliveries.filter((d) => d.status === "failed").length,
      remindersSent: recentEvents.filter((e) => e.type === "reminder_sent").length,
      remindersFailed: recentEvents.filter((e) => e.type === "reminder_failed").length,
      workflowErrors: recentEvents.filter((e) => e.type === "workflow_error").length,
    }

    const failed = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .order("desc")
      .take(MAX_ROWS)
    const pending = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(MAX_ROWS)

    const describeDelivery = async (delivery: (typeof failed)[number]) => {
      const loan = await ctx.db.get("loans", delivery.loanId)
      const tool = loan ? await ctx.db.get("tools", loan.toolId) : null
      const recipient = await ctx.db.get("users", delivery.recipientId)
      return {
        _id: delivery._id,
        event: delivery.event,
        toolName: tool?.name ?? "Removed tool",
        recipient: recipient?.name ?? "Former member",
        attempts: delivery.attempts,
        lastError: delivery.lastError,
        createdAt: delivery._creationTime,
        failedAt: delivery.failedAt,
        nextAttemptAt: delivery.nextAttemptAt,
      }
    }

    const reminderFailures = await ctx.db
      .query("automationEvents")
      .withIndex("by_type", (q) => q.eq("type", "reminder_failed"))
      .order("desc")
      .take(MAX_ROWS)
    const workflowErrors = await ctx.db
      .query("automationEvents")
      .withIndex("by_type", (q) => q.eq("type", "workflow_error"))
      .order("desc")
      .take(MAX_ROWS)

    const describeEvent = async (event: (typeof workflowErrors)[number]) => {
      const loan = event.loanId ? await ctx.db.get("loans", event.loanId) : null
      const tool = loan ? await ctx.db.get("tools", loan.toolId) : null
      return { _id: event._id, at: event.updatedAt, detail: event.detail, toolName: tool?.name }
    }

    return {
      stats,
      failed: await Promise.all(failed.map(describeDelivery)),
      retrying: await Promise.all(pending.filter((d) => d.attempts > 0).map(describeDelivery)),
      reminderFailures: await Promise.all(reminderFailures.map(describeEvent)),
      workflowErrors: await Promise.all(workflowErrors.map(describeEvent)),
    }
  },
})
