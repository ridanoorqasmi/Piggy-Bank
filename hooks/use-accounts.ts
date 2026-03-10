"use client"

import { useState, useEffect } from "react"
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Account } from "@/lib/types"
import { mapFirestoreAccountDoc } from "@/lib/firebase-mappers"

export function useAccounts(uid: string | undefined) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid || !db) {
      setAccounts([])
      setLoading(false)
      return
    }
    const accountsRef = collection(db, "users", uid, "accounts")
    const q = query(accountsRef, orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Account[] = []
        snapshot.forEach((docSnap) => {
          list.push(mapFirestoreAccountDoc(docSnap.id, docSnap.data()))
        })
        setAccounts(list)
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

  async function createAccount(data: Omit<Account, "id">): Promise<Account> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const ref = collection(db, "users", uid, "accounts")
    const payload: Record<string, unknown> = {
      name: data.name,
      type: data.type,
      balance: data.balance,
      originalAmount: data.originalAmount,
      totalSpend: data.totalSpend,
      color: data.color,
      createdAt: serverTimestamp(),
    }
    if (data.goalAmount != null) {
      payload.goalAmount = data.goalAmount
    }
    const newDocRef = doc(ref)
    setDoc(newDocRef, payload) // fire-and-forget: local cache updates immediately, onSnapshot fires right away
    return { ...data, id: newDocRef.id }
  }

  async function updateAccount(
    accountId: string,
    data: Partial<Omit<Account, "id">> & { goalAmount?: number | null }
  ): Promise<void> {
    if (!uid || !db) throw new Error("Firebase is not configured")
    const accountRef = doc(db, "users", uid, "accounts", accountId)
    const payload: Record<string, any> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.type !== undefined) payload.type = data.type
    if (data.balance !== undefined) payload.balance = data.balance
    if (data.originalAmount !== undefined)
      payload.originalAmount = data.originalAmount
    if (data.totalSpend !== undefined) payload.totalSpend = data.totalSpend
    if (data.color !== undefined) payload.color = data.color
    if (data.goalAmount === null) payload.goalAmount = deleteField()
    else if (data.goalAmount !== undefined) payload.goalAmount = data.goalAmount
    if (Object.keys(payload).length === 0) return
    updateDoc(accountRef, payload) // fire-and-forget: local cache updates immediately, onSnapshot fires right away
  }

  function deleteAccount(accountId: string): void {
    if (!uid || !db) return
    const accountRef = doc(db, "users", uid, "accounts", accountId)
    deleteDoc(accountRef) // fire-and-forget: local cache updates immediately, onSnapshot fires right away
  }

  return { accounts, loading, error, createAccount, updateAccount, deleteAccount }
}
