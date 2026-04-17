import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useTransactions } from "@/hooks/use-transactions"

const mockIncrement = vi.hoisted(() => vi.fn((n: number) => ({ _increment: n })))
const mockBatchUpdate = vi.hoisted(() => vi.fn())
const mockBatchDelete = vi.hoisted(() => vi.fn())
const mockBatchCommit = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockWriteBatch = vi.hoisted(() =>
  vi.fn(() => ({
    update: mockBatchUpdate,
    delete: mockBatchDelete,
    commit: mockBatchCommit,
  }))
)
const mockOnSnapshot = vi.hoisted(() =>
  vi.fn((_q: unknown, onNext: (snap: { forEach: (fn: (d: unknown) => void) => void }) => void) => {
    onNext({ forEach: () => {} })
    return () => {}
  })
)

vi.mock("@/lib/firebase", () => ({
  app: null,
  auth: null,
  db: {},
}))

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn((_db, ...parts: string[]) => ({ path: parts.join("/") })),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  onSnapshot: mockOnSnapshot,
  writeBatch: mockWriteBatch,
  increment: (n: number) => mockIncrement(n),
}))

describe("useTransactions — updateTransaction / deleteTransaction (Firestore batch contract)", () => {
  const uid = "user-1"

  beforeEach(() => {
    vi.clearAllMocks()
    mockBatchCommit.mockResolvedValue(undefined)
  })

  it("updateTransaction sends net balance/totalSpend deltas + transaction fields", async () => {
    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await result.current.updateTransaction(
      "tx-1",
      { accountId: "acc-1", amount: 300, type: "expense" },
      {
        amount: 300,
        type: "income",
        category: "Salary",
        description: "Test",
        date: "2024-01-01",
      }
    )

    expect(mockWriteBatch).toHaveBeenCalledTimes(1)
    expect(mockBatchUpdate).toHaveBeenCalledTimes(2)
    const accountPayload = mockBatchUpdate.mock.calls[0][1] as {
      balance: { _increment: number }
      totalSpend: { _increment: number }
    }
    expect(accountPayload.balance._increment).toBe(600)
    expect(accountPayload.totalSpend._increment).toBe(-300)
    const txPayload = mockBatchUpdate.mock.calls[1][1] as Record<string, unknown>
    expect(txPayload.amount).toBe(300)
    expect(txPayload.type).toBe("income")
    expect(txPayload.category).toBe("Salary")
    expect(mockBatchCommit).toHaveBeenCalledTimes(1)
  })

  it("deleteTransaction reverses expense on account then deletes doc", async () => {
    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await result.current.deleteTransaction({
      id: "tx-9",
      accountId: "acc-1",
      amount: 1000,
      type: "expense",
      category: "Bills",
      description: "Big",
      date: "2024-02-01",
    })

    expect(mockBatchUpdate).toHaveBeenCalledTimes(1)
    const payload = mockBatchUpdate.mock.calls[0][1] as {
      balance: { _increment: number }
      totalSpend: { _increment: number }
    }
    expect(payload.balance._increment).toBe(1000)
    expect(payload.totalSpend._increment).toBe(-1000)
    expect(mockBatchDelete).toHaveBeenCalledTimes(1)
    expect(mockBatchCommit).toHaveBeenCalledTimes(1)
  })

  it("A5.1 invalid transaction — commit rejects → updateTransaction throws", async () => {
    mockBatchCommit.mockRejectedValueOnce(new Error("No document to update"))
    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      result.current.updateTransaction(
        "missing-tx",
        { accountId: "acc-1", amount: 1, type: "income" },
        {
          amount: 2,
          type: "income",
          category: "Food",
          description: "x",
          date: "2024-01-01",
        }
      )
    ).rejects.toThrow("No document to update")
  })

  it("A3.4 second delete after success — second commit may fail (simulated)", async () => {
    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const tx = {
      id: "tx-dup",
      accountId: "acc-1",
      amount: 5,
      type: "income" as const,
      category: "Income",
      description: "x",
      date: "2024-01-01",
    }
    await result.current.deleteTransaction(tx)
    mockBatchCommit.mockRejectedValueOnce(new Error("Already deleted"))
    await expect(result.current.deleteTransaction(tx)).rejects.toThrow("Already deleted")
  })

  it("throws when uid is undefined", async () => {
    const { result } = renderHook(() => useTransactions(undefined))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      result.current.updateTransaction(
        "t",
        { accountId: "a", amount: 1, type: "expense" },
        {
          amount: 1,
          type: "expense",
          category: "Food",
          description: "x",
          date: "2024-01-01",
        }
      )
    ).rejects.toThrow("Firebase is not configured")
  })

  /**
   * A4.3: Duplicate mutation / slow-commit ordering is not modeled in this mock (no real
   * Firestore pipeline). Real behavior is covered indirectly via UI locks + Playwright where applicable.
   */
})
