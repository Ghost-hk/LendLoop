import { httpAction } from "../_generated/server"
import { internal } from "../_generated/api"
import { SIGNATURE_HEADER, verifyRequestSignature } from "./signature"

const MAX_BODY_BYTES = 16 * 1024

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

const unauthorized = () => json(401, { ok: false, error: "unauthorized" })
const badRequest = (error: string) => json(400, { ok: false, error })

async function readSigned(request: Request) {
  const secret = process.env.N8N_CONVEX_SECRET
  if (!secret) return { error: json(503, { ok: false, error: "not configured" }) }

  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > MAX_BODY_BYTES) return { error: json(413, { ok: false, error: "too large" }) }
  const body = await request.text()
  if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
    return { error: json(413, { ok: false, error: "too large" }) }
  }

  const path = new URL(request.url).pathname
  const valid = await verifyRequestSignature(
    secret,
    request.headers.get(SIGNATURE_HEADER),
    request.method,
    path,
    body,
  )
  return valid ? { body } : { error: unauthorized() }
}

function parseObject(body: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(body)
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function str(value: unknown, max: number, optional = false): string | undefined | null {
  if (value === undefined || value === null) return optional ? undefined : null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return optional ? undefined : null
  return trimmed.length <= max ? trimmed : null
}

export const overdueLoans = httpAction(async (ctx, request) => {
  const signed = await readSigned(request)
  if (signed.error) return signed.error
  return json(200, await ctx.runQuery(internal.automation.inbound.overdueLoans, {}))
})

export const reminderStatus = httpAction(async (ctx, request) => {
  const signed = await readSigned(request)
  if (signed.error) return signed.error

  const data = parseObject(signed.body)
  if (!data) return badRequest("body must be a JSON object")
  const loanId = str(data.loanId, 64)
  const idempotencyKey = str(data.idempotencyKey, 128)
  const error = str(data.error, 1000, true)
  const status = data.status
  if (!loanId || !idempotencyKey || error === null || (status !== "sent" && status !== "failed")) {
    return badRequest("expected { loanId, idempotencyKey, status: sent|failed, error? }")
  }

  const result = await ctx.runMutation(internal.automation.inbound.recordReminderStatus, {
    loanId,
    idempotencyKey,
    status,
    error,
  })
  return result.ok ? json(200, result) : badRequest(result.error)
})

export const automationError = httpAction(async (ctx, request) => {
  const signed = await readSigned(request)
  if (signed.error) return signed.error

  const data = parseObject(signed.body)
  if (!data) return badRequest("body must be a JSON object")
  const workflow = str(data.workflow, 120)
  const executionId = str(String(data.executionId ?? ""), 64)
  const node = str(data.node, 120, true)
  const message = str(typeof data.message === "string" ? data.message.slice(0, 1000) : data.message, 1000)
  const loanId = str(data.loanId, 64, true)
  if (!workflow || !executionId || !message || node === null || loanId === null) {
    return badRequest("expected { workflow, executionId, message, node?, loanId? }")
  }

  return json(
    200,
    await ctx.runMutation(internal.automation.inbound.recordWorkflowError, {
      workflow,
      executionId,
      node,
      message,
      loanId,
    }),
  )
})
