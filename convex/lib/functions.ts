import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions"
import { mutation, query, type QueryCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"
import { appError } from "./errors"

export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique()
}

async function requireUser(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx)
  if (!user) throw appError("UNAUTHENTICATED", "You need to be signed in.")
  return user
}

async function requireAdmin(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  if (user.role !== "admin") throw appError("FORBIDDEN", "Admins only.")
  return user
}

export const userQuery = customQuery(
  query,
  customCtx(async (ctx) => ({ user: await requireUser(ctx) })),
)

export const userMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await requireUser(ctx) })),
)

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => ({ user: await requireAdmin(ctx) })),
)

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await requireAdmin(ctx) })),
)
