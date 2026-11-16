# Section 5 — Convex → n8n (request notifications)

Every loan status change notifies the right person through n8n, without the mutation ever waiting on the network.

## Flow

1. **Outbox.** `recordLoanEvent` (already called by every loan transition) inserts a `webhookDeliveries` row in the same transaction as the status change, then schedules the send action. A status change and its notification can never drift apart.
2. **Send.** `automation/actions.send` loads the delivery, builds the payload from current data, signs it and POSTs it to `N8N_NOTIFY_WEBHOOK_URL` with a 10s timeout.
3. **Retries.** 3 retries over about 45 minutes (5m, 10m, 30m). A network error, timeout, 408, 429 or 5xx is retried; any other 4xx (bad signature, bad payload) fails at once, since retrying can't fix it. After the last attempt the row is `failed` with the error kept.
4. **Idempotency.** Every attempt carries the same `X-LendLoop-Delivery-Id`, so n8n can drop a duplicate when a send succeeded but its response was lost.

## Recipients

| Event | Recipient |
| --- | --- |
| requested | lender |
| approved, declined | borrower |
| cancelled | lender |
| returned | borrower |

Auto-declines (overlapping approval, tool removed) go through the same path, so those borrowers are told too.

## Payload (data minimization)

```json
{
  "event": "approved",
  "deliveryId": "…",
  "loanId": "…",
  "occurredAt": "2026-11-16T10:00:00.000Z",
  "recipient": { "email": "…", "firstName": "Sam" },
  "toolName": "Cordless drill",
  "startDate": "2026-11-20",
  "endDate": "2026-11-22"
}
```

No other person's email, no notes, no internal IDs beyond the loan and delivery. The email is read from `users` at send time and never stored in the outbox row.

## Signature

```
X-LendLoop-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(N8N_WEBHOOK_SECRET, t + "." + rawBody)>
X-LendLoop-Delivery-Id: <deliveryId>
X-LendLoop-Event: <event>
```

The receiver recomputes the HMAC over the raw body, compares in constant time and rejects timestamps older than 5 minutes. `N8N_WEBHOOK_SECRET` is used only for this direction; Section 6 has its own secret for n8n → Convex.

## Data

`webhookDeliveries`: loanId, event, recipientId, status (`pending` | `sent` | `failed`), attempts, lastError?, lastStatusCode?, sentAt?, failedAt?. Indexes `by_loan`, `by_status`.

## Files

- `convex/automation/table.ts`: outbox table.
- `convex/automation/events.ts`: `recordLoanEvent` → outbox insert + schedule.
- `convex/automation/signature.ts`: HMAC signing (Section 6 adds verification).
- `convex/automation/internal.ts`: load delivery payload, mark sent, record failure + reschedule.
- `convex/automation/actions.ts`: the send action.
- `docker-compose.yml`: n8n + Postgres for local testing (finished in Section 7).

## Env

| Where | Name | Purpose |
| --- | --- | --- |
| Convex | `N8N_NOTIFY_WEBHOOK_URL` | n8n webhook for notifications |
| Convex + n8n | `N8N_WEBHOOK_SECRET` | HMAC secret, Convex → n8n |

## Out of scope

Admin view of failed deliveries and per-loan activity lines: Section 8.

## Done when

- [ ] A status change produces a signed POST that n8n verifies, and a `sent` row.
- [ ] A broken URL produces retries, then a `failed` row with the error.
