import { v } from "convex/values"
import { internalAction } from "../_generated/server"
import { internal } from "../_generated/api"
import { signBody } from "./signature"

const TIMEOUT_MS = 30_000

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

export const send = internalAction({
  args: { deliveryId: v.id("webhookDeliveries") },
  handler: async (ctx, { deliveryId }) => {
    const payload = await ctx.runQuery(internal.automation.internal.loadDelivery, { deliveryId })
    if (!payload) {
      await ctx.runMutation(internal.automation.internal.dropUnsendable, { deliveryId })
      return
    }

    const url = process.env.N8N_NOTIFY_WEBHOOK_URL
    const secret = process.env.N8N_WEBHOOK_SECRET
    if (!url || !secret) {
      await ctx.runMutation(internal.automation.internal.recordFailure, {
        deliveryId,
        error: "N8N_NOTIFY_WEBHOOK_URL or N8N_WEBHOOK_SECRET is not set.",
        retryable: true,
      })
      return
    }

    const body = JSON.stringify(payload)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LendLoop-Signature": await signBody(secret, body),
          "X-LendLoop-Delivery-Id": deliveryId,
          "X-LendLoop-Event": payload.event,
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (response.ok) {
        await ctx.runMutation(internal.automation.internal.markSent, {
          deliveryId,
          statusCode: response.status,
        })
        return
      }

      const detail = (await response.text().catch(() => "")).slice(0, 200)
      await ctx.runMutation(internal.automation.internal.recordFailure, {
        deliveryId,
        error: `n8n responded ${response.status}${detail ? `: ${detail}` : ""}`,
        statusCode: response.status,
        retryable: isRetryableStatus(response.status),
      })
    } catch (error) {
      await ctx.runMutation(internal.automation.internal.recordFailure, {
        deliveryId,
        error: error instanceof Error ? `${error.name}: ${error.message}` : "Unknown network error",
        retryable: true,
      })
    }
  },
})
