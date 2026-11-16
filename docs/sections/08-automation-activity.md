# Section 8 — Automation activity

Shows what the automation did, live (Convex reactivity), on each loan and for admins.

## On loan rows (My requests, Incoming, Admin → Loans)

- The latest item as one quiet line under a dashed rule: "Approval email sent to you · 3 min ago", "New-request email to you didn't go through. Retrying at 3:15 PM", "… couldn't be sent" (in red).
- **Activity** popover (when there is more than one item): full timeline, newest first, with times.
- **Who sees what:** each person sees only emails sent to them. Overdue reminders go to the borrower, so only the borrower sees them. Admins see everything, with the recipient's name. Nobody sees addresses; error text is admin-only.
- Data comes with the loan view (`activity` field built by `convex/automation/activity.ts`), so it reuses the loan queries' access checks and adds no extra round trip per row.

## Admin → Automation

- **Last 7 days:** emails sent, retrying, failed; reminders sent, failed; workflow errors.
- **Failed emails:** email, recipient, attempts, last error (clamped), when it gave up, **Retry now**.
- **Retrying:** pending deliveries with their next try time (only shown when there are any).
- **Failed reminders** and **Workflow errors** from `automationEvents`.
- Mobile shows stacked rows instead of tables.

`automation.mutations.retryDelivery` (admin only): failed → pending, attempts reset, send scheduled, audit entry `delivery_retried`.

## Supporting changes

- `webhookDeliveries.nextAttemptAt` (set when a retry is scheduled).
- `automationEvents` index `by_type`.
- Admin tabs: fixed the wrapped row overlapping content on mobile and the active label disappearing on hover.

## Done when

- [x] Loan rows show live activity, filtered per person.
- [x] Popover timeline correct (checked as admin).
- [x] A 404'd delivery shows as failed; Retry now sends it and logs it in the audit log.
- [x] Desktop (1440) and mobile (390) checked; detector clean.
