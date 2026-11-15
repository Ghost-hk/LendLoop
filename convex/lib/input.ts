import { appError } from "./errors"

export function cleanText(
  value: string,
  field: string,
  { max, required = true }: { max: number; required?: boolean },
) {
  const trimmed = value.trim()
  if (required && trimmed.length === 0) throw appError("INVALID", `${field} is required.`)
  if (trimmed.length > max) throw appError("INVALID", `${field} must be ${max} characters or fewer.`)
  return trimmed
}
