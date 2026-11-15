import { ConvexError } from "convex/values"
import type { AppErrorData } from "@/convex/lib/errors"

export function errorMessage(error: unknown) {
  if (error instanceof ConvexError) {
    const data = error.data as Partial<AppErrorData> | undefined
    if (data?.message) return data.message
  }
  return "Something went wrong. Please try again."
}
