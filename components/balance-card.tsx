"use client"

import { useCurrency } from "@/contexts/currency-context"

interface BalanceCardProps {
  totalBalance: number
}

export function BalanceCard({ totalBalance }: BalanceCardProps) {
  const { formatWithSymbol } = useCurrency()
  return (
    <div className="retro-card retro-noise animate-retro-in stagger-1 relative overflow-hidden rounded-2xl bg-card p-6">
      {/* Gradient tint overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/6" />
      {/* Top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Decorative glow blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/8 blur-2xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Total Balance
        </p>
        <p className="mt-3 font-serif text-5xl tracking-tight text-foreground">
          {formatWithSymbol(totalBalance)}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/80" />
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-primary/50" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              across all accounts
            </p>
            <div className="size-1 rounded-full bg-primary/50" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/80" />
        </div>
      </div>
    </div>
  )
}
