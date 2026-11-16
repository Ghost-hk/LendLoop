import { v } from "convex/values"
import { internalMutation } from "../_generated/server"
import { addDays, today } from "../lib/dates"

// Test-only: overdue loans can't be created through the app. Remove before submission.
export const makeOverdue = internalMutation({
  args: { loanId: v.id("loans"), daysOverdue: v.number() },
  handler: async (ctx, { loanId, daysOverdue }) => {
    const endDate = addDays(today(), -daysOverdue)
    await ctx.db.patch("loans", loanId, { startDate: addDays(endDate, -2), endDate })
  },
})

// Test-only: route test users' mail to Resend's test inbox. Remove before submission.
export const setTestEmail = internalMutation({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    if (!email.endsWith("@resend.dev")) throw new Error("Test emails must be @resend.dev")
    await ctx.db.patch("users", userId, { email })
  },
})
