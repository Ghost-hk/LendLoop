const MONTH_DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

export function isoToUtcDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`)
}

export function isoToLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function localDateToIso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addDaysIso(iso: string, days: number) {
  const d = isoToUtcDate(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(start: string, end: string) {
  return Math.round((isoToUtcDate(end).getTime() - isoToUtcDate(start).getTime()) / 86_400_000)
}

export function formatDay(iso: string) {
  return MONTH_DAY.format(isoToUtcDate(iso))
}

export function formatRange(start: string, end: string) {
  return start === end ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`
}

export function loanLength(start: string, end: string) {
  const days = daysBetween(start, end) + 1
  return days === 1 ? "1 day" : `${days} days`
}

export function formatRelative(timestamp: number) {
  const diff = Date.now() - timestamp
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? "yesterday" : `${days} days ago`
}
