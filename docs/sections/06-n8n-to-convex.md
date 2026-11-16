# Section 6 — n8n → Convex (signed HTTP endpoints)

n8n reads overdue loans from Convex and writes back what it did. Every write is idempotent, so n8n retries are always safe.

## Endpoints (`convex/http.ts`)

| Endpoint | Caller | Behavior |
| --- | --- | --- |
| `GET /n8n/overdue-loans` | Overdue reminders (daily) | Approved loans with `endDate` before today (UTC). Returns `{ date, loans: [{ loanId, idempotencyKey, borrower { email, firstName }, toolName, endDate, daysOverdue }] }`. Loans already reminded today are left out. |
| `POST /n8n/reminder-status` | Overdue reminders, per email | `{ loanId, idempotencyKey, status: "sent" \| "failed", error? }`. Upsert on `idempotencyKey`; `failed → sent` upgrades the row; anything else repeated returns `{ duplicate: true }`. The key must be `overdue:<loanId>:<YYYY-MM-DD>` for the same loan. |
| `POST /n8n/automation-error` | Error workflow | `{ workflow, executionId, message, node?, loanId? }`. Recorded once per `error:<executionId>`. |

Reminders go to the borrower only, every day until the loan is returned.

## Signature

```
X-LendLoop-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(N8N_CONVEX_SECRET, t + "." + METHOD + "." + path + "." + rawBody)>
```

Method and path are signed so a signature for one endpoint (especially the body-less GET) can't be replayed on another. 5-minute window, constant-time compare, 16 KB body limit, strict field validation. Every auth failure is a plain `401 unauthorized`. Replays inside the window are harmless because every write is idempotent.

## Data

`automationEvents`: loanId?, type (`reminder_sent` | `reminder_failed` | `workflow_error`), idempotencyKey (unique via `by_key`), detail?, updatedAt. Index `by_loan` for Section 8.

## Files

- `convex/http.ts`: routes only.
- `convex/automation/endpoints.ts`: HTTP actions (signature check, body parsing, validation).
- `convex/automation/inbound.ts`: internal query/mutations behind the endpoints.
- `convex/automation/signature.ts`: `verifyRequestSignature`.
- `convex/dev/internal.ts`: test-only `makeOverdue`. **Delete before submission.**

## Env

| Where | Name |
| --- | --- |
| Convex + n8n | `N8N_CONVEX_SECRET` |
| n8n | `CONVEX_SITE_URL` (the `.convex.site` URL) |

## Done when

- [x] Valid signed requests work on all three endpoints.
- [x] Wrong secret, stale timestamp, other-path signature, tampered body and missing signature → 401; oversized → 413; bad fields → 400.
- [x] Repeated write-backs don't duplicate; `failed → sent` upgrades; a reminded loan drops off today's list.
