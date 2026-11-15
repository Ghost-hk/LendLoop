# LendLoop — Overall Plan

Neighborhood tool-lending board. Next.js (App Router) + Clerk + Convex + n8n, TypeScript.
We build this **section by section**. Each section below has a goal, scope, and a "done when" checklist.
Detailed specs for a section get written (in `docs/sections/`) right before we build it.

---

## Hosting & services

| Piece        | Where                                    |
| ------------ | ---------------------------------------- |
| Next.js app  | Vercel                                   |
| Backend + DB | Convex Cloud                             |
| Auth         | Clerk                                    |
| n8n          | Coolify on VPS (same `docker-compose.yml` reviewers use locally) |
| Email        | Resend, called **from n8n** (app never touches the Resend key) |

## Architecture (one picture)

```
Browser ──Clerk JWT──▶ Convex queries/mutations (RBAC enforced here)
                              │
                              │ mutation writes loan + outbox row, schedules action
                              ▼
                       Convex action ──HMAC-signed POST──▶ n8n "Request notification" ──▶ Resend
                                                                  
n8n "Overdue reminders" (daily cron)
   ├─ HMAC-signed GET  ──▶ Convex HTTP  /n8n/overdue-loans
   ├─ Resend email per borrower
   └─ HMAC-signed POST ──▶ Convex HTTP  /n8n/reminder-status   (idempotent)

n8n "Error handler" (error workflow for both) ──▶ email admin + POST /n8n/automation-error
```

## Key decisions

- **Roles live in Convex** (`users.role`), not Clerk metadata. Reason in README → "Design decisions".
- **Admin bootstrap**: internal mutation `users:setRole` run via Convex dashboard / `npx convex run`. Not callable from the client.
- **User sync**: on sign-in the client calls `users.store` (upsert from verified JWT identity). Email/name come from the Clerk JWT template, never from client args.
- **RBAC in one place**: `convex/lib/auth.ts` → `requireUser`, `requireAdmin`, `requireToolOwner`, `requireLoanParty`. Every public function starts with one of these.
- **Loan state machine** enforced server-side:
  `requested → approved | declined | cancelled`, `approved → returned`.
  Lender approves/declines/marks returned; borrower cancels while `requested`. No overlapping approved loans per tool.
- **Outbox pattern** for Convex → n8n: mutation inserts a `webhookDeliveries` row in the same transaction, then schedules an action that sends it. Failures retry with backoff; final failures stay visible (`status: failed`).
- **HMAC both directions**: header `X-LendLoop-Signature: t=<unix>,v1=<hex hmac-sha256(secret, t + "." + body)>`, 5-minute replay window, constant-time compare. Separate secrets per direction.
- **Idempotency**: write-backs carry an `idempotencyKey` (e.g. `overdue:<loanId>:<YYYY-MM-DD>`); Convex upserts on it, so retries never duplicate.
- **Data minimization**: public query returns name + category only. Webhook payload carries only `event, loanId, recipient {email, firstName}, toolName, startDate, endDate`. Overdue endpoint returns only what the reminder email needs.
- **Secrets**: Convex env vars, Vercel env vars, n8n env/credentials. Workflow JSON references `{{$env.*}}` / credential names only.

## Data model (Convex)

- `users`: clerkId, email, name, role (`user` | `admin`), trustedLender
- `tools`: ownerId, name, category, condition, description, removedAt?
- `loans`: toolId, borrowerId, lenderId, startDate, endDate, status, decidedAt?, returnedAt?
- `webhookDeliveries` (outbox): loanId, event, payload, status (`pending` | `sent` | `failed`), attempts, lastError?
- `automationEvents`: loanId?, type (`notification_sent`, `reminder_sent`, `reminder_failed`, `workflow_error`), idempotencyKey (unique), details, createdAt

---

## Sections

### 1. Scaffold & auth
- Next.js + TS + Tailwind + shadcn/ui, Convex, Clerk wired together.
- Clerk JWT template `convex` with email + name claims.
- `users` table + `users.store` upsert on sign-in.
- **Done when**: sign in on localhost, user row appears in Convex.

### 2. Data model & RBAC
- Full schema + indexes.
- `convex/lib/auth.ts` helpers.
- `users:setRole` internal mutation.
- **Done when**: schema deployed, helpers in place, an admin can be set from CLI.

### 3. Core backend functions
- Tools: `publicList`, `list` (with availability + category filter), `mine`, `create`, `update`, `remove`.
- Loans: `request`, `approve`, `decline`, `cancel`, `markReturned`, `myRequests`, `incoming`.
- Admin: `adminRemoveTool`, `allLoans`, `setTrustedLender`.
- Validation (date ranges, overlaps, string lengths).
- **Done when**: every function enforces RBAC + state machine; tried with two users + admin.

### 4. UI
- Public landing (`/`): name, tagline, tools (name + category), sign-in button.
- App (`/app`): Browse (filter), My listings, My requests, Incoming, Admin (only if admin).
- Forms: list/edit tool, request date range. Toasts, empty states, loading states.
- **Done when**: every user flow works end-to-end in the browser.

### 5. Convex → n8n (request notifications, outbound)
- Outbox table + scheduled send action with signing + retries/backoff.
- Triggered on request created / approved / declined / cancelled / returned.
- **Done when**: status change produces a signed POST and a `sent` delivery row.

### 6. n8n → Convex (HTTP endpoints, inbound)
- `convex/http.ts`: `GET /n8n/overdue-loans`, `POST /n8n/reminder-status`, `POST /n8n/automation-error`.
- Signature verification, idempotent upsert on `idempotencyKey`.
- **Done when**: curl with valid signature works, invalid/replayed is rejected, retry doesn't duplicate.

### 7. n8n workflows + infra
- `docker-compose.yml` (n8n + Postgres).
- Workflows: `request-notification`, `overdue-reminders`, `error-handler`. Signature verification in n8n, Resend emails, node retries, error workflow attached.
- Export JSON to `n8n/workflows/` (no secrets).
- Deploy on Coolify.
- **Done when**: real emails arrive; forced failure shows up in the error workflow + app.

### 8. Automation activity (bonus)
- Loan cards show recent `automationEvents` ("Reminder sent 2 days ago", "Notification failed").
- Admin sees failed deliveries.
- **Done when**: visible on loans in the UI.

### 9. README + production notes
- Setup (local + n8n), env vars, architecture, security & data-minimization decisions, production changes.
- **Done when**: a reviewer can clone and run it from the README alone.
