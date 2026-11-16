import { v } from "convex/values"
import { internal } from "../_generated/api"
import { recordAudit } from "../audit/helpers"
import { adminMutation } from "../lib/functions"
import { appError } from "../lib/errors"

export const retryDelivery = adminMutation({
  args: { deliveryId: v.id("webhookDeliveries") },
  handler: async (ctx, { deliveryId }) => {
    const delivery = await ctx.db.get("webhookDeliveries", deliveryId)
    if (!delivery) throw appError("NOT_FOUND", "Delivery not found.")
    if (delivery.status !== "failed") throw appError("CONFLICT", "Only failed notifications can be retried.")

    await ctx.db.patch("webhookDeliveries", deliveryId, {
      status: "pending",
      attempts: 0,
      failedAt: undefined,
      nextAttemptAt: undefined,
    })
    await ctx.scheduler.runAfter(0, internal.automation.actions.send, { deliveryId })

    const loan = await ctx.db.get("loans", delivery.loanId)
    const tool = loan ? await ctx.db.get("tools", loan.toolId) : null
    await recordAudit(ctx, {
      actorId: ctx.user._id,
      action: "delivery_retried",
      subjectUserId: delivery.recipientId,
      toolId: loan?.toolId,
      detail: `${delivery.event} · ${tool?.name ?? "removed tool"}`,
    })
  },
})
