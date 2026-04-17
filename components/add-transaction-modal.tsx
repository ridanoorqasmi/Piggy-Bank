"use client"

import { useState, useEffect } from "react"
import { addTransactionSchema } from "@/lib/validations"
import {
  firstZodIssueMessage,
  parsePositiveTransactionAmount,
  sanitizeTransactionAmountInput,
} from "@/lib/transaction-amount-input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CategoryPicker } from "@/components/category-picker"
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/constants/categories"

export type AddTransactionData = {
  amount: number
  type: "expense" | "income"
  category: string
  description: string
  date: string
}

interface AddTransactionModalProps {
  accountId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (accountId: string, data: AddTransactionData) => Promise<void>
}

const today = new Date().toISOString().split("T")[0]

export function AddTransactionModal({
  accountId,
  open,
  onOpenChange,
  onSave,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(today)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setAmount("")
      setCategory("")
      setDescription("")
      setDate(today)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (type === "expense" && category && !EXPENSE_CATEGORIES.some((c) => c.name === category)) {
      setCategory("")
    }
    if (type === "income" && category && !INCOME_CATEGORIES.some((c) => c.name === category)) {
      setCategory("")
    }
  }, [type, category])

  async function handleSubmit() {
    setError(null)
    const parsedAmount = parsePositiveTransactionAmount(amount)
    if (!parsedAmount.ok) {
      setError(parsedAmount.message)
      return
    }
    const result = addTransactionSchema.safeParse({
      amount: parsedAmount.value,
      type,
      category: category.trim(),
      description: description.trim() || "—",
      date: date || today,
    })
    if (!result.success) {
      setError(firstZodIssueMessage(result.error))
      return
    }
    setSubmitting(true)
    try {
      await onSave(accountId, result.data)
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save transaction")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) onOpenChange(nextOpen)
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="font-serif text-xl text-foreground">
            Add Transaction
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-6">
          {error && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2 rounded-xl border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                type === "expense"
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(232,133,108,0.15)]"
                  : "text-muted-foreground"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                type === "income"
                  ? "bg-piggy-success text-background shadow-[0_0_12px_rgba(141,181,128,0.15)]"
                  : "text-muted-foreground"
              }`}
            >
              Income
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </Label>
            <Input
              id="amount"
              data-testid="transaction-amount-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amount}
              onChange={(e) =>
                setAmount(sanitizeTransactionAmountInput(e.target.value))
              }
              className="h-12 rounded-xl border-border bg-muted font-serif text-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              id="add-category-label"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Category
            </Label>
            <CategoryPicker
              id="add-category-picker"
              aria-labelledby="add-category-label"
              variant={type === "expense" ? "expense" : "income"}
              value={category}
              onChange={setCategory}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </div>

          <div className="retro-divider border-t" />

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(232,133,108,0.2)] active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Transaction"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
