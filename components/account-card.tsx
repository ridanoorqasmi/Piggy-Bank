"use client"

import type { Account } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/contexts/currency-context"

interface AccountCardProps {
  account: Account
  /** Derived current balance from calculateAccountFinancials. Falls back to account.balance. */
  currentBalance?: number
  onClick: (account: Account) => void
}

export function AccountCard({ account, currentBalance, onClick }: AccountCardProps) {
  const { formatWithSymbol } = useCurrency()
  const displayBalance = currentBalance ?? account.balance
  const goalProgress = account.goalAmount
    ? Math.min(Math.round((displayBalance / account.goalAmount) * 100), 100)
    : null

  return (
    <button
      onClick={() => onClick(account)}
      className="retro-card retro-noise group relative w-full overflow-hidden rounded-2xl bg-card p-5 text-left transition-all active:scale-[0.98]"
    >
      {/* Left accent border */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: account.color }}
      />
      {/* Subtle color tint on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `${account.color}08` }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Color dot with glow */}
          <div
            className="size-3 shrink-0 rounded-full"
            style={{
              backgroundColor: account.color,
              boxShadow: `0 0 10px ${account.color}60, 0 0 4px ${account.color}40`,
            }}
          />
          <h3 className="font-serif text-base text-foreground">{account.name}</h3>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full border border-border/60 bg-muted px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {account.type === "saving" ? "Saving" : "Spending"}
        </Badge>
      </div>

      <p className="relative mt-3 font-serif text-3xl tracking-tight text-foreground">
        {formatWithSymbol(displayBalance)}
      </p>

      {goalProgress !== null && (
        <div className="relative mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Goal: {account.goalAmount != null ? formatWithSymbol(account.goalAmount) : ""}
            </span>
            <span className="text-[10px] font-bold" style={{ color: account.color }}>
              {goalProgress}%
            </span>
          </div>
          {/* Custom progress bar using account color */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${goalProgress}%`,
                backgroundColor: account.color,
                boxShadow: `0 0 6px ${account.color}60`,
              }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
