import { v } from "convex/values"
import { internalMutation } from "../_generated/server"
import { appError } from "../lib/errors"
import { roleValidator } from "../lib/validators"
import { recordAudit } from "../audit/helpers"

export const setRole = internalMutation({
  args: { email: v.string(), role: roleValidator },
  handler: async (ctx, { email, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .unique()
    if (!user) throw appError("NOT_FOUND", `No user with email ${email}. Sign in once first.`)
    await ctx.db.patch("users", user._id, { role })
    await recordAudit(ctx, { action: "role_changed", subjectUserId: user._id, detail: role })
    return { userId: user._id, role }
  },
})
