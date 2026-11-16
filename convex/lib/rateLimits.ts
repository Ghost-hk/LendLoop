import { HOUR, RateLimiter } from "@convex-dev/rate-limiter"
import { components } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"
import { appError } from "./errors"

const rateLimiter = new RateLimiter(components.rateLimiter, {
  loanRequest: { kind: "token bucket", rate: 10, period: HOUR, capacity: 5 },
  toolWrite: { kind: "token bucket", rate: 20, period: HOUR, capacity: 10 },
})

const ACTIONS = {
  loanRequest: "borrow requests",
  toolWrite: "listing changes",
} as const

export async function enforceRateLimit(ctx: MutationCtx, name: keyof typeof ACTIONS, userId: Id<"users">) {
  const { ok, retryAfter } = await rateLimiter.limit(ctx, name, { key: userId })
  if (ok) return
  const minutes = Math.max(1, Math.ceil(retryAfter / 60_000))
  throw appError(
    "RATE_LIMITED",
    `Too many ${ACTIONS[name]} in a short time. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  )
}
