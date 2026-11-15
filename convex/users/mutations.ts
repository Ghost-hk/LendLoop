import { mutation } from "../_generated/server"
import { appError } from "../lib/errors"

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw appError("UNAUTHENTICATED", "You need to be signed in.")

    const profile = {
      clerkId: identity.subject,
      email: (identity.email ?? "").toLowerCase(),
      name: identity.name ?? identity.givenName ?? "Neighbor",
      imageUrl: identity.pictureUrl,
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (existing) {
      await ctx.db.patch("users", existing._id, profile)
      return existing._id
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      ...profile,
      role: "user",
      trustedLender: false,
    })
  },
})
