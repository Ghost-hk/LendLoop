import { appError } from "./errors"
import { LIMITS } from "./validators"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: string) {
  if (!ISO_DATE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(start: string, end: string) {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

export function rangesOverlap(
  a: { startDate: string; endDate: string },
  b: { startDate: string; endDate: string },
) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

export function validateLoanDates(startDate: string, endDate: string) {
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    throw appError("INVALID", "Dates must be valid YYYY-MM-DD dates.")
  }
  const now = today()
  if (startDate < now) throw appError("INVALID", "Start date can't be in the past.")
  if (endDate < startDate) throw appError("INVALID", "End date must be on or after the start date.")
  if (daysBetween(startDate, endDate) + 1 > LIMITS.maxLoanDays) {
    throw appError("INVALID", `Loans can be at most ${LIMITS.maxLoanDays} days.`)
  }
  if (startDate > addDays(now, LIMITS.maxLeadDays)) {
    throw appError("INVALID", `Loans can start at most ${LIMITS.maxLeadDays} days ahead.`)
  }
}
