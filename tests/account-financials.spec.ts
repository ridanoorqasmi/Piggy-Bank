import { describe, it, expect } from "vitest"
import { calculateAccountFinancials } from "@/lib/account-financials"
import type { Account, Transaction } from "@/lib/types"

function makeAccount(partial: Partial<Account> = {}): Account {
  return {
    id: "acc-1",
    name: "Test",
    type: "spending",
    balance: 0,
    originalAmount: 0,
    totalSpend: 0,
    color: "#000",
    ...partial,
  }
}

function tx(
  overrides: Partial<Transaction> & Pick<Transaction, "amount" | "type">
): Transaction {
  return {
    id: `t-${Math.random()}`,
    accountId: "acc-1",
    category: "food",
    description: "tx",
    date: "2025-01-01",
    ...overrides,
  } as Transaction
}

describe("calculateAccountFinancials — single source of truth for balance", () => {
  it("no transactions -> currentBalance equals openingBalance", () => {
    const account = makeAccount({ originalAmount: 1000, balance: 1000 })
    const f = calculateAccountFinancials(account, [])
    expect(f.openingBalance).toBe(1000)
    expect(f.totalIncome).toBe(0)
    expect(f.totalExpense).toBe(0)
    expect(f.currentBalance).toBe(1000)
    expect(f.remainingBudget).toBe(1000)
  })

  it("only expenses -> currentBalance = opening − expenses", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 200, type: "expense" }),
      tx({ amount: 300, type: "expense" }),
    ])
    expect(f.totalExpense).toBe(500)
    expect(f.totalIncome).toBe(0)
    expect(f.currentBalance).toBe(500)
    expect(f.remainingBudget).toBe(500)
  })

  it("only income -> currentBalance = opening + income", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 200, type: "income" }),
      tx({ amount: 300, type: "income" }),
    ])
    expect(f.totalIncome).toBe(500)
    expect(f.totalExpense).toBe(0)
    expect(f.currentBalance).toBe(1500)
    expect(f.remainingBudget).toBe(1000)
  })

  it("mixed income and expenses -> opening + income − expenses", () => {
    const account = makeAccount({ originalAmount: 5000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 1000, type: "income" }),
      tx({ amount: 500, type: "expense" }),
      tx({ amount: 1500, type: "expense" }),
      tx({ amount: 200, type: "income" }),
    ])
    expect(f.totalIncome).toBe(1200)
    expect(f.totalExpense).toBe(2000)
    expect(f.currentBalance).toBe(4200)
  })

  it("income must never be counted as spent", () => {
    const account = makeAccount({ originalAmount: 0 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 1000, type: "income" }),
    ])
    expect(f.totalExpense).toBe(0)
  })

  it("zero opening balance + only expense -> negative currentBalance", () => {
    const account = makeAccount({ originalAmount: 0 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 250, type: "expense" }),
    ])
    expect(f.currentBalance).toBe(-250)
  })

  it("decimal values preserve precision within 2 decimals", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 100.5, type: "income" }),
      tx({ amount: 50.25, type: "expense" }),
    ])
    expect(f.totalIncome).toBeCloseTo(100.5, 5)
    expect(f.totalExpense).toBeCloseTo(50.25, 5)
    expect(f.currentBalance).toBeCloseTo(1050.25, 5)
  })

  it("ignores transactions for other accounts", () => {
    const account = makeAccount({ id: "acc-1", originalAmount: 1000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 999, type: "expense", accountId: "acc-2" }),
      tx({ amount: 100, type: "expense", accountId: "acc-1" }),
    ])
    expect(f.totalExpense).toBe(100)
    expect(f.currentBalance).toBe(900)
  })

  it("edit simulation: expense becomes income recomputes balance", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const before = calculateAccountFinancials(account, [
      tx({ id: "t1", amount: 300, type: "expense" }),
    ])
    expect(before.currentBalance).toBe(700)

    const after = calculateAccountFinancials(account, [
      tx({ id: "t1", amount: 300, type: "income" }),
    ])
    expect(after.currentBalance).toBe(1300)
  })

  it("delete simulation: removing a transaction updates balance", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const before = calculateAccountFinancials(account, [
      tx({ id: "t1", amount: 400, type: "expense" }),
      tx({ id: "t2", amount: 100, type: "expense" }),
    ])
    expect(before.currentBalance).toBe(500)

    const after = calculateAccountFinancials(account, [
      tx({ id: "t2", amount: 100, type: "expense" }),
    ])
    expect(after.currentBalance).toBe(900)
  })

  it(
    "REGRESSION — openingBalance=37000, income=15000, expenses=29050 -> currentBalance=22950",
    () => {
      const account = makeAccount({
        id: "acc-march",
        name: "Expenses March to Mid april",
        originalAmount: 37000,
        balance: 7950, // intentionally stale/wrong — must NOT influence result
        totalSpend: 29050,
      })
      const f = calculateAccountFinancials(account, [
        tx({ accountId: "acc-march", amount: 15000, type: "income" }),
        tx({ accountId: "acc-march", amount: 6000, type: "expense" }),
        tx({ accountId: "acc-march", amount: 6000, type: "expense" }),
        tx({ accountId: "acc-march", amount: 1050, type: "expense" }),
        tx({ accountId: "acc-march", amount: 6000, type: "expense" }),
        tx({ accountId: "acc-march", amount: 10000, type: "expense" }),
      ])
      expect(f.openingBalance).toBe(37000)
      expect(f.totalIncome).toBe(15000)
      expect(f.totalExpense).toBe(29050)
      expect(f.currentBalance).toBe(22950)
      expect(f.remainingBudget).toBe(7950)
    }
  )

  it("homepage card and detail screen derive the exact same currentBalance", () => {
    // Same helper must be the single source of truth consumed by every screen.
    const account = makeAccount({
      originalAmount: 37000,
      balance: 7950, // stale cache — detail previously already ignored this,
                     // homepage used to read it directly. They must now agree.
    })
    const transactions = [
      tx({ amount: 15000, type: "income" }),
      tx({ amount: 29050, type: "expense" }),
    ]

    const homepage = calculateAccountFinancials(account, transactions).currentBalance
    const detail = calculateAccountFinancials(account, transactions).currentBalance

    expect(homepage).toBe(detail)
    expect(homepage).toBe(22950)
  })

  it("label meaning: totalExpense (shown as 'Spent') equals ONLY the expense sum", () => {
    const account = makeAccount({ originalAmount: 1000 })
    const f = calculateAccountFinancials(account, [
      tx({ amount: 500, type: "income" }),
      tx({ amount: 200, type: "expense" }),
    ])
    // "Spent" must never include income. Otherwise the label would lie.
    expect(f.totalExpense).toBe(200)
    expect(f.totalExpense).not.toBe(f.totalExpense - f.totalIncome)
  })
})
