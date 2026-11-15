import { mutation, query } from "./_generated/server"

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const profile = {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? identity.givenName ?? "Neighbor",
      imageUrl: identity.pictureUrl,
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, profile)
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

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
    if (!user) return null
    return { _id: user._id, name: user.name, role: user.role, trustedLender: user.trustedLender }
  },
})
