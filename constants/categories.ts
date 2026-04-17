/**
 * Single source of truth for category labels and colors.
 * Do not duplicate this list or hardcode colors in components.
 */

import type { Transaction } from "@/lib/types"

/** Unknown / legacy strings — neutral gray per product spec */
export const FALLBACK_CATEGORY_COLOR = "#888888"

export const EXPENSE_CATEGORIES = [
  { name: "Bills & Utilities", key: "bills", color: "#FF6B6B" },
  { name: "Rent / Housing", key: "rent", color: "#F06595" },
  { name: "Groceries", key: "groceries", color: "#51CF66" },
  { name: "Transport", key: "transport", color: "#C9A87C" },
  { name: "Food & Dining", key: "food_dining", color: "#E8957A" },
  { name: "Shopping", key: "shopping", color: "#7BA8BE" },
  { name: "Personal Care", key: "personal_care", color: "#B89FC9" },
  { name: "Medical / Healthcare", key: "medical", color: "#6BA8C4" },
  { name: "Education", key: "education", color: "#8A9FD4" },
  { name: "Work Expenses", key: "work", color: "#A3B58A" },
  { name: "Entertainment", key: "entertainment", color: "#D4B85C" },
  { name: "Travel", key: "travel", color: "#5DA9A3" },
  { name: "Family Support", key: "family", color: "#D4A89A" },
  { name: "Debt / Loans", key: "debt", color: "#9A8B8E" },
  { name: "Miscellaneous", key: "misc", color: "#A89F91" },
] as const

/**
 * Income categories — greens / blues / teals. One fixed color per name.
 * (#26A69A was duplicated for Rental vs Reimbursements in the brief; Reimbursements uses #009688.)
 */
export const INCOME_CATEGORIES = [
  { name: "Salary", key: "salary", color: "#4CAF50" },
  { name: "Business Income", key: "business_income", color: "#2ECC71" },
  { name: "Freelance / Side Hustle", key: "freelance", color: "#00C853" },
  { name: "Investments", key: "investments", color: "#00ACC1" },
  { name: "Rental Income", key: "rental_income", color: "#26A69A" },
  { name: "Profit / Returns", key: "profit_returns", color: "#43A047" },
  { name: "Family Support", key: "family_support_income", color: "#7CB342" },
  { name: "Gifts Received", key: "gifts_received", color: "#66BB6A" },
  { name: "Refunds", key: "refunds", color: "#26C6DA" },
  { name: "Cashback / Rewards", key: "cashback_rewards", color: "#29B6F6" },
  { name: "Reimbursements", key: "reimbursements", color: "#009688" },
  { name: "Miscellaneous", key: "misc_income", color: "#90A4AE" },
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

const EXPENSE_BY_NAME_LOWER = new Map(
  EXPENSE_CATEGORIES.map((c) => [c.name.toLowerCase(), c] as const)
)
const INCOME_BY_NAME_LOWER = new Map(
  INCOME_CATEGORIES.map((c) => [c.name.toLowerCase(), c] as const)
)

/** Legacy expense-only aliases (stored strings → canonical expense name). */
const LEGACY_EXPENSE: Record<string, string> = {
  food: "Food & Dining",
  bills: "Bills & Utilities",
  bill: "Bills & Utilities",
  "bills & utilities": "Bills & Utilities",
  rent: "Rent / Housing",
  housing: "Rent / Housing",
  groceries: "Groceries",
  grocery: "Groceries",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  medical: "Medical / Healthcare",
  healthcare: "Medical / Healthcare",
  education: "Education",
  work: "Work Expenses",
  travel: "Travel",
  family: "Family Support",
  debt: "Debt / Loans",
  loans: "Debt / Loans",
  misc: "Miscellaneous",
  miscellaneous: "Miscellaneous",
  other: "Miscellaneous",
  personal: "Personal Care",
  "personal care": "Personal Care",
}

/**
 * Legacy income-only aliases. Old app used a single "Income" label — map to Miscellaneous (income).
 */
const LEGACY_INCOME: Record<string, string> = {
  income: "Miscellaneous",
}

/**
 * When transaction type is unknown, shared short keys prefer expense where unambiguous.
 */
const LEGACY_SHARED: Record<string, string> = {
  ...LEGACY_EXPENSE,
}

/**
 * Resolve stored category string to canonical label for display + grouping.
 * Pass `type` whenever available so names shared between expense/income lists resolve correctly.
 */
export function resolveCanonicalCategoryName(
  raw: string,
  type?: Transaction["type"]
): string {
  const t = raw.trim()
  if (!t) return "Miscellaneous"

  const lower = t.toLowerCase()

  if (type === "expense") {
    if (LEGACY_EXPENSE[lower]) return LEGACY_EXPENSE[lower]
    const hit = EXPENSE_BY_NAME_LOWER.get(lower)
    if (hit) return hit.name
    return t
  }

  if (type === "income") {
    if (LEGACY_INCOME[lower]) return LEGACY_INCOME[lower]
    const hit = INCOME_BY_NAME_LOWER.get(lower)
    if (hit) return hit.name
    return t
  }

  if (LEGACY_SHARED[lower]) return LEGACY_SHARED[lower]
  const exp = EXPENSE_BY_NAME_LOWER.get(lower)
  if (exp) return exp.name
  const inc = INCOME_BY_NAME_LOWER.get(lower)
  if (inc) return inc.name
  return t
}

/**
 * Color for dots, charts, selectors — always from config. `type` disambiguates shared names
 * (e.g. "Family Support", "Miscellaneous") between expense and income lists.
 */
export function getCategoryColor(
  categoryLabel: string,
  type: Transaction["type"]
): string {
  const canonical = resolveCanonicalCategoryName(categoryLabel, type)
  const lower = canonical.toLowerCase()

  if (type === "expense") {
    const exp = EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === lower)
    if (exp) return exp.color
  } else {
    const inc = INCOME_CATEGORIES.find((c) => c.name.toLowerCase() === lower)
    if (inc) return inc.color
  }

  return FALLBACK_CATEGORY_COLOR
}

export function isExpenseCategoryName(name: string): boolean {
  return EXPENSE_CATEGORIES.some((c) => c.name === name)
}

export function isIncomeCategoryName(name: string): boolean {
  return INCOME_CATEGORIES.some((c) => c.name === name)
}
