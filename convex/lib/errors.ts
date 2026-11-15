import { ConvexError } from "convex/values"

export type AppErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID" | "CONFLICT"

export type AppErrorData = { code: AppErrorCode; message: string }

export function appError(code: AppErrorCode, message: string) {
  return new ConvexError<AppErrorData>({ code, message })
}
