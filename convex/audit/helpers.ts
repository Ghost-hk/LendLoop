import type { MutationCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"

export async function recordAudit(ctx: MutationCtx, entry: Omit<Doc<"auditLog">, "_id" | "_creationTime">) {
  await ctx.db.insert("auditLog", entry)
}
