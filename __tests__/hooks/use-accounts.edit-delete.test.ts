import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useAccounts } from "@/hooks/use-accounts"

const mockDocRef = { id: "mock-ref" }
const mockUpdateDoc = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockDeleteDoc = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
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
  doc: vi.fn(() => mockDocRef),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  deleteField: vi.fn(() => ({ __delete: true })),
  serverTimestamp: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: mockOnSnapshot,
}))

describe("useAccounts (edit and delete)", () => {
  const uid = "test-user-1"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("updateAccount", () => {
    it("calls Firestore updateDoc with account ref and partial payload when updating name", async () => {
      const { result } = renderHook(() => useAccounts(uid))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.updateAccount("acc-123", { name: "New Account Name" })

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, { name: "New Account Name" })
    })

    it("calls updateDoc with multiple fields when updating type, color and goalAmount", async () => {
      const { result } = renderHook(() => useAccounts(uid))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.updateAccount("acc-456", {
        type: "saving",
        color: "#8DB580",
        goalAmount: 1000,
      })

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        type: "saving",
        color: "#8DB580",
        goalAmount: 1000,
      })
    })

    it("sends deleteField() for goalAmount when goalAmount is null (clear goal)", async () => {
      const { result } = renderHook(() => useAccounts(uid))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.updateAccount("acc-789", { goalAmount: null })

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        goalAmount: { __delete: true },
      })
    })

    it("throws when db is not configured (uid undefined)", async () => {
      const { result } = renderHook(() => useAccounts(undefined))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        result.current.updateAccount("acc-1", { name: "X" })
      ).rejects.toThrow("Firebase is not configured")
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })
  })

  describe("deleteAccount", () => {
    it("calls Firestore deleteDoc with account ref", async () => {
      const { result } = renderHook(() => useAccounts(uid))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.deleteAccount("acc-delete-1")

      expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it("does not call deleteDoc when uid is undefined (deleteAccount is a no-op)", async () => {
      const { result } = renderHook(() => useAccounts(undefined))
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      result.current.deleteAccount("acc-1")
      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })
  })
})
