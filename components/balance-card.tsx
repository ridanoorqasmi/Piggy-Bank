"use client"

interface BalanceCardProps {
  totalBalance: number
}

export function BalanceCard({ totalBalance }: BalanceCardProps) {
  return (
    <div className="retro-card retro-noise animate-retro-in stagger-1 rounded-2xl bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Total Balance
      </p>
      <p className="mt-2 font-serif text-4xl tracking-tight text-foreground">
        {"$"}
        {totalBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          across all accounts
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
