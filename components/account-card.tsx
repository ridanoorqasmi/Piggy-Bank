"use client"

import type { Account } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AccountCardProps {
  account: Account
  onClick: (account: Account) => void
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const goalProgress = account.goalAmount
    ? Math.round((account.balance / account.goalAmount) * 100)
    : null

  return (
    <button
      onClick={() => onClick(account)}
      className="retro-card retro-noise w-full rounded-2xl bg-card p-5 text-left transition-all active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-3 rounded-full ring-2 ring-offset-1 ring-offset-card"
            style={{ backgroundColor: account.color, boxShadow: `0 0 8px ${account.color}40` }}
          />
          <h3 className="font-serif text-base text-foreground">{account.name}</h3>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full border border-border bg-muted px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {account.type === "saving" ? "Saving" : "Spending"}
        </Badge>
      </div>

      <p className="mt-3 font-serif text-2xl text-foreground">
        {"$"}
        {account.balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {goalProgress !== null && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Goal: ${account.goalAmount?.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-primary">
              {goalProgress}%
            </span>
          </div>
          <Progress
            value={goalProgress}
            className="h-1.5 bg-muted"
          />
        </div>
      )}
    </button>
  )
}
