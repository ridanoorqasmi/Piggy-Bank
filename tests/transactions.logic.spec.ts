/**
 * Transaction balance & validation logic (Vitest).
 * Balance deltas mirror hooks/use-transactions.ts update/delete + add semantics.
 */
import { describe, it, expect } from "vitest"
import { editTransactionSchema } from "@/lib/validations"

type TxType = "expense" | "income"

interface SimAccount {
  balance: number
  totalSpend: number
}

function applyAdd(acc: SimAccount, type: TxType, amount: number): SimAccount {
  if (type === "expense") {
    return {
      balance: acc.balance - amount,
      totalSpend: acc.totalSpend + amount,
    }
  }
  return { balance: acc.balance + amount, totalSpend: acc.totalSpend }
}

/** Same formulas as useTransactions.updateTransaction */
function applyUpdate(
  acc: SimAccount,
  previous: { amount: number; type: TxType },
  next: { amount: number; type: TxType }
): SimAccount {
  const balanceDelta =
    (previous.type === "expense" ? previous.amount : -previous.amount) +
    (next.type === "expense" ? -next.amount : next.amount)
  const totalSpendDelta =
    (previous.type === "expense" ? -previous.amount : 0) +
    (next.type === "expense" ? next.amount : 0)
  return {
    balance: acc.balance + balanceDelta,
    totalSpend: acc.totalSpend + totalSpendDelta,
  }
}

function applyDelete(acc: SimAccount, t: { amount: number; type: TxType }): SimAccount {
  if (t.type === "expense") {
    return {
      balance: acc.balance + t.amount,
      totalSpend: acc.totalSpend - t.amount,
    }
  }
  return { balance: acc.balance - t.amount, totalSpend: acc.totalSpend }
}

const baseEdit = {
  category: "Food",
  description: "Title",
  date: "2024-06-01",
}

describe("A1 — amount edge cases (validation)", () => {
  it("A1.1 zero amount — validation rejects", () => {
    const r = editTransactionSchema.safeParse({
      ...baseEdit,
      amount: 0,
      type: "expense" as const,
    })
    expect(r.success).toBe(false)
  })

  it("A1.2 negative amount — validation rejects (no corrupted parse path)", () => {
    const r = editTransactionSchema.safeParse({
      ...baseEdit,
      amount: -50,
      type: "expense" as const,
    })
    expect(r.success).toBe(false)
  })

  it("A1.3 very large number — accepted", () => {
    const r = editTransactionSchema.safeParse({
      ...baseEdit,
      amount: 999_999_999,
      type: "income" as const,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.amount).toBe(999_999_999)
  })

  it("A1.4 decimal value — accepted", () => {
    const r = editTransactionSchema.safeParse({
      ...baseEdit,
      amount: 100.55,
      type: "expense" as const,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.amount).toBe(100.55)
  })

  it("A1.5 empty / non-finite amount coerced to 0 — validation rejects", () => {
    const r = editTransactionSchema.safeParse({
      ...baseEdit,
      amount: 0,
      type: "expense" as const,
    })
    expect(r.success).toBe(false)
  })
})

describe("A2 — edit behavior edge cases (balance simulation)", () => {
  it("A2.1 change expense to income (+1000 income, -300 expense → edit to income 300 → balance 1300)", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 1000)
    acc = applyAdd(acc, "expense", 300)
    expect(acc.balance).toBe(700)
    acc = applyUpdate(acc, { amount: 300, type: "expense" }, { amount: 300, type: "income" })
    expect(acc.balance).toBe(1300)
  })

  it("A2.2 change income to expense — balance drops by 400 from +200 income-only state", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 200)
    expect(acc.balance).toBe(200)
    acc = applyUpdate(acc, { amount: 200, type: "income" }, { amount: 200, type: "expense" })
    expect(acc.balance).toBe(-200)
  })

  it("A2.3 edit without changes — no balance drift", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "expense", 300)
    const before = { ...acc }
    acc = applyUpdate(acc, { amount: 300, type: "expense" }, { amount: 300, type: "expense" })
    expect(acc).toEqual(before)
  })

  it("A2.4 sequential identical updates — still consistent (no drift)", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "expense", 100)
    acc = applyUpdate(acc, { amount: 100, type: "expense" }, { amount: 100, type: "expense" })
    acc = applyUpdate(acc, { amount: 100, type: "expense" }, { amount: 100, type: "expense" })
    expect(acc.balance).toBe(-100)
    expect(acc.totalSpend).toBe(100)
  })
})

describe("A3 — delete edge cases (simulation)", () => {
  it("A3.1 delete only transaction — balance returns to 0 after sole income removed", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 100)
    acc = applyDelete(acc, { amount: 100, type: "income" })
    expect(acc.balance).toBe(0)
  })

  it("A3.2 delete large expense — balance increases by 1000", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 2000)
    acc = applyAdd(acc, "expense", 1000)
    expect(acc.balance).toBe(1000)
    acc = applyDelete(acc, { amount: 1000, type: "expense" })
    expect(acc.balance).toBe(2000)
  })

  it("A3.3 delete large income — balance decreases by 500", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 500)
    expect(acc.balance).toBe(500)
    acc = applyDelete(acc, { amount: 500, type: "income" })
    expect(acc.balance).toBe(0)
  })
})

describe("A4 — balance consistency", () => {
  it("A4.1 multiple edits and deletes — final balance matches remaining signed flow", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 500)
    acc = applyAdd(acc, "expense", 100)
    acc = applyAdd(acc, "expense", 50)
    acc = applyUpdate(acc, { amount: 100, type: "expense" }, { amount: 80, type: "expense" })
    acc = applyDelete(acc, { amount: 50, type: "expense" })
    expect(acc.balance).toBe(500 - 80)
    expect(acc.totalSpend).toBe(80)
  })

  /**
   * A4.2 / A4.3: Persistence and delayed Firestore responses require a real client or emulator;
   * covered in Playwright (reload) where env allows. No extra unit coverage here.
   */
})

describe("A5 — data integrity (validation)", () => {
  it("A5.3 missing title — rejected", () => {
    const r = editTransactionSchema.safeParse({
      amount: 10,
      type: "expense" as const,
      category: "Food",
      description: "",
      date: "2024-01-01",
    })
    expect(r.success).toBe(false)
  })

  it("A5.4 missing type — rejected", () => {
    const r = editTransactionSchema.safeParse({
      amount: 10,
      category: "Food",
      description: "x",
      date: "2024-01-01",
    })
    expect(r.success).toBe(false)
  })
})

describe("A6 — critical multi-step scenario", () => {
  it("A6.1 income +1000, expense 300, edit expense to 500, delete income → balance -500", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "income", 1000)
    acc = applyAdd(acc, "expense", 300)
    expect(acc.balance).toBe(700)
    acc = applyUpdate(acc, { amount: 300, type: "expense" }, { amount: 500, type: "expense" })
    expect(acc.balance).toBe(500)
    acc = applyDelete(acc, { amount: 1000, type: "income" })
    expect(acc.balance).toBe(-500)
  })
})

describe("A7 — performance / stability (simulation scale)", () => {
  it("A7.1 many transactions then edit + delete — exact balance", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    const n = 120
    for (let i = 0; i < n; i++) {
      acc = applyAdd(acc, "expense", 1)
    }
    expect(acc.balance).toBe(-n)
    expect(acc.totalSpend).toBe(n)
    acc = applyUpdate(acc, { amount: 1, type: "expense" }, { amount: 2, type: "expense" })
    expect(acc.balance).toBe(-n - 1)
    acc = applyDelete(acc, { amount: 2, type: "expense" })
    expect(acc.balance).toBe(-n + 1)
    expect(acc.totalSpend).toBe(n - 1)
  })

  it("A7.2 frequent sequential valid edits — final state stable", () => {
    let acc: SimAccount = { balance: 0, totalSpend: 0 }
    acc = applyAdd(acc, "expense", 10)
    for (let i = 0; i < 20; i++) {
      const prevAmt = 10 + i
      const nextAmt = 10 + i + 1
      acc = applyUpdate(
        acc,
        { amount: prevAmt, type: "expense" },
        { amount: nextAmt, type: "expense" }
      )
    }
    expect(acc.balance).toBe(-30)
    expect(acc.totalSpend).toBe(30)
  })
})
