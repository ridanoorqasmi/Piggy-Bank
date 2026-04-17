import type { Account, Transaction } from "./types"

/**
 * Single source of truth for per-account summary numbers.
 *
 * Transactions store positive `amount` plus a `type` ("expense" | "income").
 * currentBalance = openingBalance + totalIncome − totalExpense
 * remainingBudget = openingBalance − totalExpense (budget-only view; not shown by default).
 *
 * IMPORTANT: UI screens MUST consume this helper instead of reading
 * `account.balance` / `account.totalSpend`, which are cached fields that can go
 * stale (e.g., when the account is edited) and lead to inconsistent numbers.
 */
export interface AccountFinancials {
  openingBalance: number
  totalIncome: number
  totalExpense: number
  currentBalance: number
  remainingBudget: number
}

export function calculateAccountFinancials(
  account: Pick<Account, "id" | "originalAmount">,
  allTransactions: Transaction[]
): AccountFinancials {
  let totalIncome = 0
  let totalExpense = 0
  for (const t of allTransactions) {
    if (t.accountId !== account.id) continue
    if (t.type === "expense") totalExpense += t.amount
    else if (t.type === "income") totalIncome += t.amount
  }
  const openingBalance = account.originalAmount
  return {
    openingBalance,
    totalIncome,
    totalExpense,
    currentBalance: openingBalance + totalIncome - totalExpense,
    remainingBudget: openingBalance - totalExpense,
  }
}
