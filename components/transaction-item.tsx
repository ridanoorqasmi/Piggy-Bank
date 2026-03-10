"use client"

import type { Transaction } from "@/lib/types"
import { categoryColors } from "@/lib/data"
import { useCurrency } from "@/contexts/currency-context"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { formatWithSymbol } = useCurrency()
  const color = categoryColors[transaction.category] ?? "#B8A08A"
  const isExpense = transaction.type === "expense"

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex size-9 items-center justify-center rounded-lg border border-border"
          style={{ backgroundColor: `${color}15` }}
        >
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {transaction.description}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {transaction.category}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-serif text-sm ${
            isExpense ? "text-foreground" : "text-piggy-success"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatWithSymbol(transaction.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(transaction.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  )
}
