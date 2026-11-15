import { defineTable } from "convex/server"
import { v } from "convex/values"
import { loanStatusValidator } from "../lib/validators"

export const loans = defineTable({
  toolId: v.id("tools"),
  borrowerId: v.id("users"),
  lenderId: v.id("users"),
  startDate: v.string(),
  endDate: v.string(),
  status: loanStatusValidator,
  note: v.optional(v.string()),
  decidedAt: v.optional(v.number()),
  returnedAt: v.optional(v.number()),
})
  .index("by_borrower", ["borrowerId"])
  .index("by_lender", ["lenderId"])
  .index("by_tool", ["toolId"])
  .index("by_status_endDate", ["status", "endDate"])
