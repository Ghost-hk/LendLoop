# Section 7 — n8n workflows

Three workflows in `n8n/workflows/`, importable as-is. No secrets inside: the Resend key is the n8n credential **Resend API** (Header Auth, `Authorization: Bearer <key>`), and HMAC secrets come from env vars via `$env`.

## Request notification (`request-notification.json`)

Webhook `POST /webhook/lendloop-notify` (raw body) → **Verify signature** (HMAC over `t.rawBody`, 5-min window, constant-time, delivery-id header must match body) → **Valid?**
- valid → **Build email** (one template per event, HTML + text, Shadow Board palette) → **Send via Resend** (`Idempotency-Key: notify:<deliveryId>`, 3 tries × 5s) → **Accept** `200`.
- invalid → **Reject** `401`.

If Resend still fails, the workflow errors, n8n answers 500, Convex retries on its own schedule (5m/10m/30m) and the error workflow fires. A Convex retry of a send that did go through is dropped by Resend's idempotency key.

| Event | To | Link |
| --- | --- | --- |
| requested | lender | /app/incoming |
| approved, declined | borrower | /app/requests, /app |
| cancelled | lender | /app/incoming |
| returned | borrower | /app/requests |

## Overdue reminders (`overdue-reminders.json`)

**Every day 08:00 UTC** (or **Run now**) → **Sign request** → **Fetch overdue loans** (signed GET, 3 tries × 10s) → **One item per loan** → **Build reminder** → **Send reminder** (`Idempotency-Key: overdue:<loanId>:<date>`, 3 tries, 1 email per 600ms) →
- success → **Sign sent status** → **Report sent** (`POST /n8n/reminder-status`, signed, 3 tries)
- error output → **Sign failed status** → **Report failed**

One bad address doesn't stop the batch. Re-running the same day only retries reminders that failed.

## Error handler (`error-handler.json`)

Set as the error workflow on the other two. **Error Trigger** → **Build report** →
- **Sign report** → **Record in LendLoop** (`POST /n8n/automation-error`, idempotent per execution)
- **Build alert** → **Email admin** (`ADMIN_ALERT_EMAIL`)

## n8n env (docker-compose)

`N8N_WEBHOOK_SECRET`, `N8N_CONVEX_SECRET`, `CONVEX_SITE_URL`, `RESEND_FROM`, `ADMIN_ALERT_EMAIL`, `APP_URL`, plus `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` and `NODE_FUNCTION_ALLOW_BUILTIN=crypto` for the Code nodes.

## Verified locally (n8n 2.47.7 via ngrok)

- [x] All five events → `sent` deliveries → emails delivered (Resend test inboxes).
- [x] Overdue run → reminder delivered → `reminder_sent` written back; same-day rerun sends nothing.
- [x] Invalid recipient → `reminder_failed` with reason; later rerun upgrades it to `reminder_sent`.
- [x] Notification failure → n8n 500 → Convex retry scheduled; error workflow records `workflow_error` and emails the admin.
- [x] Workflow JSON contains no keys, secrets or personal emails.
- [x] Deployed on Coolify: `https://n8n.dawdi.dev` (project **LendLoop**, compose resource `lendloop-n8n`). Request email and overdue reminder verified end to end from production n8n.

## Coolify deploy notes

- Coolify deploys `docker-compose.yml` only; `docker-compose.override.yml` (host port 5678) is for local use and is merged automatically by `docker compose`.
- Domain set on the `n8n` service as `https://n8n.dawdi.dev:5678` (Traefik routes to container port 5678, Let's Encrypt cert).
- Env set in Coolify: fresh `N8N_DB_PASSWORD` / `N8N_ENCRYPTION_KEY`, the two HMAC secrets (same values as Convex), `NEXT_PUBLIC_CONVEX_SITE_URL`, `RESEND_FROM`, `ADMIN_ALERT_EMAIL`, `APP_URL`, `N8N_PUBLIC_URL`, `N8N_SECURE_COOKIE=true`, `N8N_PROXY_HOPS=1`.
- Owner account claimed right after the first boot. Credential and workflows loaded through the n8n public API with a short-lived key (deleted after). Imported workflows get new IDs, so the error workflow and credential references were remapped at import.
