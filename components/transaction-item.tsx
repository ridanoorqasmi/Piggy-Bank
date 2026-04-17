"use client"

import type { Transaction } from "@/lib/types"
import {
  getCategoryColor,
  resolveCanonicalCategoryName,
} from "@/constants/categories"
import { useCurrency } from "@/contexts/currency-context"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const { formatWithSymbol } = useCurrency()
  const categoryLabel = resolveCanonicalCategoryName(
    transaction.category,
    transaction.type
  )
  const color = getCategoryColor(transaction.category, transaction.type)
  const isExpense = transaction.type === "expense"
  const showMenu = Boolean(onEdit || onDelete)

  return (
    <div className="flex items-center justify-between gap-2 py-3" data-testid="transaction-item">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border"
          style={{ backgroundColor: `${color}15` }}
        >
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="min-w-0">
          <p
            data-testid="transaction-title"
            className="text-sm font-semibold text-foreground"
          >
            {transaction.description}
          </p>
          <p
            data-testid="transaction-category"
            className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {categoryLabel}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Transaction options"
                data-testid="transaction-options-trigger"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onEdit && (
                <DropdownMenuItem
                  data-testid="edit-transaction-button"
                  className="gap-2"
                  onClick={() => onEdit(transaction)}
                >
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  data-testid="delete-transaction-button"
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => onDelete(transaction)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <div className="text-right">
          <p
            data-testid="transaction-amount"
            className={`font-serif text-sm ${
              isExpense ? "text-destructive" : "text-piggy-success"
            }`}
          >
            {isExpense ? "-" : "+"}
            {formatWithSymbol(Math.abs(transaction.amount))}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
