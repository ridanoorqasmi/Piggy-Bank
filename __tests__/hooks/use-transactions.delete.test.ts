import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useTransactions } from "@/hooks/use-transactions"

const mockBatchDelete = vi.hoisted(() => vi.fn())
const mockBatchCommit = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockWriteBatch = vi.hoisted(() =>
  vi.fn(function (this: void) {
    return { delete: mockBatchDelete, commit: mockBatchCommit }
  })
)
const mockGetDocs = vi.hoisted(() => vi.fn())
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
  doc: vi.fn(),
  getDocs: mockGetDocs,
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  onSnapshot: mockOnSnapshot,
  writeBatch: mockWriteBatch,
  increment: vi.fn(),
}))

describe("useTransactions (deleteTransactionsByAccountId)", () => {
  const uid = "test-user-1"

  beforeEach(() => {
    vi.clearAllMocks()
    mockBatchCommit.mockResolvedValue(undefined)
  })

  it("calls getDocs with query by accountId then batch-deletes each doc and commits", async () => {
    const mockDocRefs = [{ ref: "ref-1" }, { ref: "ref-2" }]
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: mockDocRefs.map((r) => ({ ref: r.ref })),
    })

    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.deleteTransactionsByAccountId("account-xyz")

    expect(mockGetDocs).toHaveBeenCalledTimes(1)
    expect(mockWriteBatch).toHaveBeenCalledTimes(1)
    expect(mockBatchDelete).toHaveBeenCalledTimes(2)
    expect(mockBatchDelete).toHaveBeenNthCalledWith(1, "ref-1")
    expect(mockBatchDelete).toHaveBeenNthCalledWith(2, "ref-2")
    expect(mockBatchCommit).toHaveBeenCalledTimes(1)
  })

  it("does not call writeBatch or commit when snapshot is empty", async () => {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] })

    const { result } = renderHook(() => useTransactions(uid))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.deleteTransactionsByAccountId("account-empty")

    expect(mockGetDocs).toHaveBeenCalledTimes(1)
    expect(mockWriteBatch).not.toHaveBeenCalled()
    expect(mockBatchCommit).not.toHaveBeenCalled()
  })

  it("throws when uid is undefined", async () => {
    const { result } = renderHook(() => useTransactions(undefined))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(
      result.current.deleteTransactionsByAccountId("account-1")
    ).rejects.toThrow("Firebase is not configured")
    expect(mockGetDocs).not.toHaveBeenCalled()
  })
})
