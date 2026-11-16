import type { LoanEvent } from "@/convex/lib/validators"

export type ActivityState = "sending" | "retrying" | "sent" | "failed"

export type ActivityItem = {
  id: string
  kind: "notification" | "reminder"
  event?: LoanEvent
  state: ActivityState
  at: number
  nextAttemptAt?: number
  recipient?: string
}

const EVENT_LABELS: Record<LoanEvent, string> = {
  requested: "New-request email",
  approved: "Approval email",
  declined: "Decline email",
  cancelled: "Cancellation email",
  returned: "Return confirmation",
}

const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })

export function activityLabel(item: Pick<ActivityItem, "kind" | "event">) {
  if (item.kind === "reminder") return "Overdue reminder"
  return item.event ? EVENT_LABELS[item.event] : "Email"
}

export function isLoanEvent(value: string): value is LoanEvent {
  return value in EVENT_LABELS
}

export function eventEmailLabel(event: LoanEvent) {
  return EVENT_LABELS[event]
}

export function describeActivity(item: ActivityItem) {
  const label = activityLabel(item)
  const who = item.recipient ?? "you"
  switch (item.state) {
    case "sent":
      return `${label} sent to ${who}`
    case "sending":
      return `Sending ${label.toLowerCase()} to ${who}…`
    case "retrying":
      return item.nextAttemptAt
        ? `${label} to ${who} didn't go through. Retrying at ${TIME.format(item.nextAttemptAt)}`
        : `${label} to ${who} didn't go through. Retrying soon`
    case "failed":
      return `${label} to ${who} couldn't be sent`
  }
}
