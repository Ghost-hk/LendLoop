import { clerkMiddleware } from "@clerk/nextjs/server"
import { authorizedOrigins } from "@/lib/authorized-origins"

export default clerkMiddleware(
  authorizedOrigins.length > 0 ? { authorizedParties: authorizedOrigins } : undefined,
)

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
