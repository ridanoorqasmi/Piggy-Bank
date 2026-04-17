export interface Account {
  id: string
  name: string
  type: "spending" | "saving"
  balance: number
  originalAmount: number
  totalSpend: number
  goalAmount?: number | null
  color: string
}

export interface Transaction {
  id: string
  accountId: string
  category: string
  description: string
  /** Magnitude (always ≥ 0). Sign for display is implied by `type`. */
  amount: number
  date: string
  type: "expense" | "income"
}

export type Screen =
  | "auth"
  | "dashboard"
  | "create-account"
  | "edit-account"
  | "account-detail"
  | "insights"
  | "profile"
