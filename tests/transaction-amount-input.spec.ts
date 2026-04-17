import { describe, it, expect } from "vitest"
import {
  parsePositiveTransactionAmount,
  sanitizeTransactionAmountInput,
} from "@/lib/transaction-amount-input"

describe("sanitizeTransactionAmountInput", () => {
  it("removes minus signs", () => {
    expect(sanitizeTransactionAmountInput("-009")).toBe("009")
    expect(sanitizeTransactionAmountInput("-100.5")).toBe("100.5")
  })

  it("strips invalid characters", () => {
    expect(sanitizeTransactionAmountInput("12abc34")).toBe("1234")
  })

  it("allows at most one decimal point", () => {
    expect(sanitizeTransactionAmountInput("1.2.3")).toBe("1.23")
  })

  it("preserves leading zeros while typing", () => {
    expect(sanitizeTransactionAmountInput("00.9")).toBe("00.9")
  })
})

describe("parsePositiveTransactionAmount", () => {
  it("rejects empty", () => {
    const r = parsePositiveTransactionAmount("")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toBe("Amount must be greater than 0")
  })

  it("rejects zero", () => {
    expect(parsePositiveTransactionAmount("0").ok).toBe(false)
    expect(parsePositiveTransactionAmount("0.00").ok).toBe(false)
  })

  it("accepts decimals", () => {
    const r = parsePositiveTransactionAmount("100.55")
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(100.55)
  })

  it("normalizes via abs (defensive)", () => {
    const r = parsePositiveTransactionAmount("-50")
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(50)
  })
})
