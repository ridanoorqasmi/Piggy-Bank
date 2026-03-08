import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore"
import type { Firestore } from "firebase/firestore"
import type { Transaction } from "./types"

/**
 * Update an account's balance and totalSpend after adding a transaction.
 * Expense: balance -= amount, totalSpend += amount.
 * Income: balance += amount.
 */
export async function updateAccountBalance(
  db: Firestore,
  uid: string,
  accountId: string,
  transaction: Pick<Transaction, "amount" | "type">
): Promise<void> {
  const accountRef = doc(db, "users", uid, "accounts", accountId)
  const accountSnap = await getDoc(accountRef)
  if (!accountSnap.exists()) return
  const data = accountSnap.data()
  let balance = Number(data.balance) ?? 0
  let totalSpend = Number(data.totalSpend) ?? 0
  if (transaction.type === "expense") {
    balance -= transaction.amount
    totalSpend += transaction.amount
  } else {
    balance += transaction.amount
  }
  await updateDoc(accountRef, { balance, totalSpend })
}
