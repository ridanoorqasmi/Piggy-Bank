import { describe, it, expect } from "vitest"
import { calculateSummary } from "@/lib/summary-calc"

function assertConservation(
  original: number,
  transactions: { amount: number }[],
  inBank: number
) {
  const sumTx = transactions.reduce((s, t) => s + t.amount, 0)
  expect(original + sumTx).toBe(inBank)
}

describe("Summary Calculation", () => {
  it("TEST 1 — No Transactions", () => {
    const original = 1000
    const transactions: { amount: number }[] = []
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(0)
    expect(r.income).toBe(0)
    expect(r.inBank).toBe(1000)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 2 — Only Expenses", () => {
    const original = 1000
    const transactions = [{ amount: -200 }, { amount: -300 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(500)
    expect(r.income).toBe(0)
    expect(r.inBank).toBe(500)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 3 — Only Income", () => {
    const original = 1000
    const transactions = [{ amount: 200 }, { amount: 300 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(0)
    expect(r.income).toBe(500)
    expect(r.inBank).toBe(1500)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 4 — Mixed Basic", () => {
    const original = 1000
    const transactions = [{ amount: 500 }, { amount: -200 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(200)
    expect(r.income).toBe(500)
    expect(r.inBank).toBe(1300)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 5 — Mixed Multiple", () => {
    const original = 5000
    const transactions = [
      { amount: 1000 },
      { amount: -500 },
      { amount: -1500 },
      { amount: 200 },
    ]
    const r = calculateSummary(original, transactions)
    expect(r.income).toBe(1200)
    expect(r.spent).toBe(2000)
    expect(r.inBank).toBe(4200)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 6 — Zero Value", () => {
    const original = 1000
    const transactions = [{ amount: 0 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(0)
    expect(r.income).toBe(0)
    expect(r.inBank).toBe(1000)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 7 — Decimal Values", () => {
    const original = 1000
    const transactions = [{ amount: 100.5 }, { amount: -50.25 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(50.25)
    expect(r.income).toBe(100.5)
    expect(r.inBank).toBe(1050.25)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 8 — Large Numbers", () => {
    const original = 1_000_000
    const transactions = [{ amount: 500_000 }, { amount: -200_000 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(200_000)
    expect(r.income).toBe(500_000)
    expect(r.inBank).toBe(1_300_000)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 9 — Negative Final Balance", () => {
    const original = 1000
    const transactions = [{ amount: -1500 }]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(1500)
    expect(r.income).toBe(0)
    expect(r.inBank).toBe(-500)
    assertConservation(original, transactions, r.inBank)
  })

  it("TEST 10 — Real Scenario", () => {
    const original = 37_000
    const transactions = [
      { amount: 15_000 },
      { amount: -6000 },
      { amount: -1050 },
      { amount: -6000 },
      { amount: -10_000 },
    ]
    const r = calculateSummary(original, transactions)
    expect(r.spent).toBe(23_050)
    expect(r.income).toBe(15_000)
    expect(r.inBank).toBe(28_950)
    assertConservation(original, transactions, r.inBank)
  })
})
