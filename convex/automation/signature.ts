const encoder = new TextEncoder()

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function signBody(secret: string, body: string, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${await hmacHex(secret, `${timestamp}.${body}`)}`
}

export const SIGNATURE_HEADER = "X-LendLoop-Signature"
const TOLERANCE_SECONDS = 300

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyRequestSignature(
  secret: string,
  header: string | null,
  method: string,
  path: string,
  body: string,
) {
  if (!header) return false
  const parts = new Map(
    header.split(",").map((part) => {
      const index = part.indexOf("=")
      return [part.slice(0, index).trim(), part.slice(index + 1).trim()] as const
    }),
  )
  const timestamp = Number(parts.get("t"))
  const given = parts.get("v1")
  if (!given || !Number.isInteger(timestamp)) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false

  const expected = await hmacHex(secret, `${timestamp}.${method}.${path}.${body}`)
  return timingSafeEqual(expected, given.toLowerCase())
}
