import type { ZodError } from "zod"

/**
 * Strips `-` and invalid characters; keeps at most one decimal point.
 * Leading zeros are preserved while typing (e.g. "009" → user can finish "0.09").
 */
export function sanitizeTransactionAmountInput(raw: string): string {
  const noMinus = raw.replace(/-/g, "")
  let s = noMinus.replace(/[^0-9.]/g, "")
  const dot = s.indexOf(".")
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "")
  }
  return s
}

const AMOUNT_REQUIRED = "Amount must be greater than 0"

export function parsePositiveTransactionAmount(
  sanitized: string
): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = sanitized.trim()
  if (trimmed === "") return { ok: false, message: AMOUNT_REQUIRED }
  const n = Number.parseFloat(trimmed)
  if (!Number.isFinite(n)) return { ok: false, message: AMOUNT_REQUIRED }
  const value = Math.abs(n)
  if (value <= 0) return { ok: false, message: AMOUNT_REQUIRED }
  return { ok: true, value }
}

/** Use for Zod failures — never stringify the whole error object into UI. */
export function firstZodIssueMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input"
}
