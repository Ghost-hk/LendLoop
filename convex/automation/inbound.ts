import { v } from "convex/values"
import { internalMutation, internalQuery } from "../_generated/server"
import { daysBetween, today } from "../lib/dates"
import { firstName } from "../users/helpers"

export function overdueKey(loanId: string, day: string) {
  return `overdue:${loanId}:${day}`
}

export const overdueLoans = internalQuery({
  args: {},
  handler: async (ctx) => {
    const day = today()
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_status_endDate", (q) => q.eq("status", "approved").lt("endDate", day))
      .collect()

    const results = []
    for (const loan of loans) {
      const idempotencyKey = overdueKey(loan._id, day)
      const existing = await ctx.db
        .query("automationEvents")
        .withIndex("by_key", (q) => q.eq("idempotencyKey", idempotencyKey))
        .unique()
      if (existing?.type === "reminder_sent") continue

      const borrower = await ctx.db.get("users", loan.borrowerId)
      if (!borrower) continue
      const tool = await ctx.db.get("tools", loan.toolId)

      results.push({
        loanId: loan._id,
        idempotencyKey,
        borrower: { email: borrower.email, firstName: firstName(borrower.name) },
        toolName: tool?.name ?? "a tool",
        endDate: loan.endDate,
        daysOverdue: daysBetween(loan.endDate, day),
      })
    }
    return { date: day, loans: results }
  },
})

export const recordReminderStatus = internalMutation({
  args: {
    loanId: v.string(),
    idempotencyKey: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { loanId, idempotencyKey, status, error }) => {
    const id = ctx.db.normalizeId("loans", loanId)
    const match = /^overdue:([^:]+):(\d{4}-\d{2}-\d{2})$/.exec(idempotencyKey)
    if (!id || !match || match[1] !== loanId) return { ok: false as const, error: "invalid key or loan" }
    if (!(await ctx.db.get("loans", id))) return { ok: false as const, error: "unknown loan" }

    const type = status === "sent" ? "reminder_sent" : "reminder_failed"
    const detail = status === "failed" ? error?.slice(0, 300) : undefined
    const existing = await ctx.db
      .query("automationEvents")
      .withIndex("by_key", (q) => q.eq("idempotencyKey", idempotencyKey))
      .unique()

    if (!existing) {
      await ctx.db.insert("automationEvents", { loanId: id, type, idempotencyKey, detail, updatedAt: Date.now() })
      return { ok: true as const, duplicate: false }
    }
    if (existing.type === "reminder_failed" && type === "reminder_sent") {
      await ctx.db.patch("automationEvents", existing._id, { type, detail: undefined, updatedAt: Date.now() })
      return { ok: true as const, duplicate: false }
    }
    return { ok: true as const, duplicate: true }
  },
})

export const recordWorkflowError = internalMutation({
  args: {
    workflow: v.string(),
    executionId: v.string(),
    node: v.optional(v.string()),
    message: v.string(),
    loanId: v.optional(v.string()),
  },
  handler: async (ctx, { workflow, executionId, node, message, loanId }) => {
    const idempotencyKey = `error:${executionId}`
    const existing = await ctx.db
      .query("automationEvents")
      .withIndex("by_key", (q) => q.eq("idempotencyKey", idempotencyKey))
      .unique()
    if (existing) return { ok: true as const, duplicate: true }

    const id = loanId ? ctx.db.normalizeId("loans", loanId) : null
    const where = node ? `${workflow} › ${node}` : workflow
    await ctx.db.insert("automationEvents", {
      loanId: id ?? undefined,
      type: "workflow_error",
      idempotencyKey,
      detail: `${where}: ${message}`.slice(0, 500),
      updatedAt: Date.now(),
    })
    return { ok: true as const, duplicate: false }
  },
})
