import { literals } from "convex-helpers/validators"
import type { Infer } from "convex/values"

export const CATEGORIES = [
  "power_tools",
  "hand_tools",
  "garden",
  "kitchen",
  "camping",
  "cleaning",
  "ladders_moving",
  "other",
] as const

export const CONDITIONS = ["new", "like_new", "good", "fair", "worn"] as const

export const LOAN_STATUSES = ["requested", "approved", "declined", "cancelled", "returned"] as const

export const ROLES = ["user", "admin"] as const

export const LIMITS = {
  toolName: 80,
  toolDescription: 500,
  loanNote: 280,
} as const

export const categoryValidator = literals(...CATEGORIES)
export const conditionValidator = literals(...CONDITIONS)
export const loanStatusValidator = literals(...LOAN_STATUSES)
export const roleValidator = literals(...ROLES)

export type Category = Infer<typeof categoryValidator>
export type Condition = Infer<typeof conditionValidator>
export type LoanStatus = Infer<typeof loanStatusValidator>
export type Role = Infer<typeof roleValidator>
