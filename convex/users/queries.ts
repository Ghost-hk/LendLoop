import { query } from "../_generated/server"
import { getCurrentUser } from "../lib/functions"

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null
    return {
      _id: user._id,
      name: user.name,
      imageUrl: user.imageUrl,
      role: user.role,
      trustedLender: user.trustedLender,
    }
  },
})
