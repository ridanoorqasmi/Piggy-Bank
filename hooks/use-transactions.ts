"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Transaction } from "@/lib/types"
import { mapFirestoreTransactionDoc, normalizeCategory } from "@/lib/firebase-mappers"

/** Same fields as AddTransactionData — kept here to avoid importing UI from hooks */
export type TransactionUpsertPayload = {
  amount: number
  type: "expense" | "income"
  category: string
  description: string
  date: string
}

export function useTransactions(uid: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid || !db) {
      setTransactions([])
      setLoading(false)
      return
    }
    const txRef = collection(db, "users", uid, "transactions")
    const q = query(txRef, orderBy("date", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = []
        snapshot.forEach((docSnap) => {
          list.push(mapFirestoreTransactionDoc(docSnap.id, docSnap.data()))
        })
        setTransactions(list)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [uid])

  async function addTransaction(
    accountId: string,
    data: {
      amount: number
      type: "expense" | "income"
      category: string
      description: string
      date: string
    }
  ): Promise<void> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const amount = Math.abs(data.amount)
    const txCol = collection(db, "users", uid, "transactions")
    const category = normalizeCategory(data.category, data.type)
    const batch = writeBatch(db)
    const newTxRef = doc(txCol)
    batch.set(newTxRef, {
      accountId,
      amount,
      type: data.type,
      category,
      description: data.description || "—",
      date: data.date,
      createdAt: serverTimestamp(),
    })
    const accountRef = doc(db, "users", uid, "accounts", accountId)
    if (data.type === "expense") {
      batch.update(accountRef, {
        balance: increment(-amount),
        totalSpend: increment(amount),
      })
    } else {
      batch.update(accountRef, { balance: increment(amount) })
    }
    batch.commit() // fire-and-forget: local cache updates immediately, onSnapshot fires right away
  }

  async function deleteTransactionsByAccountId(accountId: string): Promise<void> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const txCol = collection(db, "users", uid, "transactions")
    const q = query(txCol, where("accountId", "==", accountId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  async function updateTransaction(
    transactionId: string,
    previous: Pick<Transaction, "accountId" | "amount" | "type">,
    data: TransactionUpsertPayload
  ): Promise<void> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const prevAmount = Math.abs(previous.amount)
    const nextAmount = Math.abs(data.amount)
    const balanceDelta =
      (previous.type === "expense" ? prevAmount : -prevAmount) +
      (data.type === "expense" ? -nextAmount : nextAmount)
    const totalSpendDelta =
      (previous.type === "expense" ? -prevAmount : 0) +
      (data.type === "expense" ? nextAmount : 0)

    const batch = writeBatch(db)
    const txRef = doc(db, "users", uid, "transactions", transactionId)
    const accountRef = doc(db, "users", uid, "accounts", previous.accountId)
    const category = normalizeCategory(data.category, data.type)
    batch.update(accountRef, {
      balance: increment(balanceDelta),
      totalSpend: increment(totalSpendDelta),
    })
    batch.update(txRef, {
      amount: nextAmount,
      type: data.type,
      category,
      description: data.description || "—",
      date: data.date,
    })
    await batch.commit()
  }

  async function deleteTransaction(transaction: Transaction): Promise<void> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const batch = writeBatch(db)
    const txRef = doc(db, "users", uid, "transactions", transaction.id)
    const accountRef = doc(db, "users", uid, "accounts", transaction.accountId)
    const amt = Math.abs(transaction.amount)
    if (transaction.type === "expense") {
      batch.update(accountRef, {
        balance: increment(amt),
        totalSpend: increment(-amt),
      })
    } else {
      batch.update(accountRef, { balance: increment(-amt) })
    }
    batch.delete(txRef)
    await batch.commit()
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransactionsByAccountId,
    updateTransaction,
    deleteTransaction,
  }
}
