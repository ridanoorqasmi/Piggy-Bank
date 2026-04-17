"use client"

import { cn } from "@/lib/utils"
import {
  EXPENSE_CATEGORIES,
  FALLBACK_CATEGORY_COLOR,
  INCOME_CATEGORIES,
  type ExpenseCategory,
  type IncomeCategory,
} from "@/constants/categories"

type CategoryRow = ExpenseCategory | IncomeCategory

interface CategoryPickerProps {
  variant: "expense" | "income"
  value: string
  onChange: (canonicalName: string) => void
  id?: string
  "aria-labelledby"?: string
}

export function CategoryPicker({
  variant,
  value,
  onChange,
  id,
  "aria-labelledby": ariaLabelledBy,
}: CategoryPickerProps) {
  const rows: CategoryRow[] =
    variant === "expense"
      ? [...EXPENSE_CATEGORIES]
      : [...INCOME_CATEGORIES]

  const selectedRow = rows.find((c) => c.name === value)
  const previewColor = selectedRow?.color ?? FALLBACK_CATEGORY_COLOR

  return (
    <div
      id={id}
      role="listbox"
      aria-labelledby={ariaLabelledBy}
      className="flex max-h-[48vh] flex-col overflow-hidden rounded-xl border border-border bg-muted/40"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/50 bg-card/60 px-3 py-2.5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: previewColor }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {value ? value : "Select a category"}
        </span>
      </div>
      <div className="max-h-[42vh] min-h-0 flex-1 overflow-y-auto overscroll-contain py-1.5 pl-2 pr-1">
        <div className="flex flex-col gap-0.5">
          {rows.map((c) => {
            const selected = value === c.name
            return (
              <button
                key={c.key}
                type="button"
                role="option"
                aria-selected={selected}
                data-testid="category-option"
                data-category={c.name}
                onClick={() => onChange(c.name)}
                className={cn(
                  "flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-card text-foreground ring-1 ring-primary/40"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate leading-snug">{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
