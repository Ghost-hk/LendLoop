export const authorizedOrigins = (process.env.CLERK_AUTHORIZED_PARTIES ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
