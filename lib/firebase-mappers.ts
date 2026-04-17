import type { Account, Transaction } from "./types"
import type { DocumentData } from "firebase/firestore"
import { resolveCanonicalCategoryName } from "@/constants/categories"

/** Firestore document: users/{uid} */
export interface FirestoreUserDoc {
  displayName: string
  email: string
  createdAt: { seconds: number; nanoseconds: number }
}

/** Firestore document: users/{uid}/accounts/{accountId} */
export interface FirestoreAccountDoc {
  name: string
  type: "spending" | "saving"
  balance: number
  originalAmount: number
  totalSpend: number
  goalAmount?: number
  color: string
  createdAt: { seconds: number; nanoseconds: number }
}

/** Firestore document: users/{uid}/transactions/{txId} */
export interface FirestoreTransactionDoc {
  accountId: string
  category: string
  description: string
  amount: number
  type: "expense" | "income"
  date: string
  createdAt: { seconds: number; nanoseconds: number }
}

/** Data required to create an account (no id, no createdAt - added by client) */
export type FirestoreAccountCreate = Omit<FirestoreAccountDoc, "createdAt">

/** Data required to create a transaction */
export type FirestoreTransactionCreate = Omit<FirestoreTransactionDoc, "createdAt">

export function mapFirestoreAccountDoc(
  id: string,
  data: DocumentData | FirestoreAccountDoc
): Account {
  const d = data as FirestoreAccountDoc
  return {
    id,
    name: d.name,
    type: d.type,
    balance: d.balance,
    originalAmount: d.originalAmount ?? d.balance,
    totalSpend: d.totalSpend ?? 0,
    goalAmount: d.goalAmount,
    color: d.color,
  }
}

export function mapFirestoreTransactionDoc(
  id: string,
  data: DocumentData | FirestoreTransactionDoc
): Transaction {
  const d = data as FirestoreTransactionDoc
  const raw = Number(d.amount)
  const amount = Number.isFinite(raw) ? Math.abs(raw) : 0
  return {
    id,
    accountId: d.accountId,
    category: normalizeCategory(d.category, d.type),
    description: d.description,
    amount,
    date: d.date,
    type: d.type,
  }
}

/** Map to canonical label from constants (legacy aliases → single display name). */
export function normalizeCategory(
  category: string,
  type?: Transaction["type"]
): string {
  return resolveCanonicalCategoryName(category, type)
}
