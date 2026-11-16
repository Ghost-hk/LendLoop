import type { QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import type { LoanEvent } from "../lib/validators"

export type ActivityPerspective = "borrower" | "lender" | "admin"
export type ActivityState = "sending" | "retrying" | "sent" | "failed"

export type ActivityItem = {
  id: string
  kind: "notification" | "reminder"
  event?: LoanEvent
  state: ActivityState
  at: number
  nextAttemptAt?: number
  recipient?: string
}

const MAX_ITEMS = 20

function deliveryState(delivery: Doc<"webhookDeliveries">): ActivityState {
  if (delivery.status === "sent") return "sent"
  if (delivery.status === "failed") return "failed"
  return delivery.attempts > 0 ? "retrying" : "sending"
}

export async function loanActivity(
  ctx: QueryCtx,
  loan: Doc<"loans">,
  perspective: ActivityPerspective,
  nameOf: (id: Id<"users">) => Promise<string>,
): Promise<ActivityItem[]> {
  const viewerId = perspective === "borrower" ? loan.borrowerId : perspective === "lender" ? loan.lenderId : null

  const deliveries = await ctx.db
    .query("webhookDeliveries")
    .withIndex("by_loan", (q) => q.eq("loanId", loan._id))
    .collect()
  const items: ActivityItem[] = []
  for (const delivery of deliveries) {
    if (viewerId && delivery.recipientId !== viewerId) continue
    items.push({
      id: delivery._id,
      kind: "notification",
      event: delivery.event,
      state: deliveryState(delivery),
      at: delivery.sentAt ?? delivery.failedAt ?? delivery._creationTime,
      nextAttemptAt: delivery.nextAttemptAt,
      recipient: viewerId ? undefined : await nameOf(delivery.recipientId),
    })
  }

  if (perspective !== "lender") {
    const events = await ctx.db
      .query("automationEvents")
      .withIndex("by_loan", (q) => q.eq("loanId", loan._id))
      .collect()
    for (const event of events) {
      if (event.type === "workflow_error") continue
      items.push({
        id: event._id,
        kind: "reminder",
        state: event.type === "reminder_sent" ? "sent" : "failed",
        at: event.updatedAt,
        recipient: viewerId ? undefined : await nameOf(loan.borrowerId),
      })
    }
  }

  return items.sort((a, b) => b.at - a.at).slice(0, MAX_ITEMS)
}
