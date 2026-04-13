"use client"

import { useState, useEffect, useRef } from "react"
import { editTransactionSchema } from "@/lib/validations"
import type { Transaction } from "@/lib/types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AddTransactionData } from "@/components/add-transaction-modal"
import { toast } from "@/hooks/use-toast"

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Income"]

function firstZodMessage(issues: { path: (string | number)[]; message: string }[]): string {
  return issues[0]?.message ?? "Invalid input"
}

interface EditTransactionModalProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    transactionId: string,
    previous: Pick<Transaction, "accountId" | "amount" | "type">,
    data: AddTransactionData
  ) => Promise<void>
}

export function EditTransactionModal({
  transaction,
  open,
  onOpenChange,
  onSave,
}: EditTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitLockRef = useRef(false)

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategory(transaction.category)
      setTitle(transaction.description === "—" ? "" : transaction.description)
      setDate(transaction.date)
      setError(null)
      setSubmitting(false)
    }
  }, [open, transaction])

  async function handleSubmit() {
    if (!transaction || submitLockRef.current) return
    submitLockRef.current = true
    try {
      setError(null)
      const numAmount = parseFloat(amount)
      const result = editTransactionSchema.safeParse({
        amount: Number.isFinite(numAmount) ? numAmount : 0,
        type,
        category: category.trim(),
        description: title.trim(),
        date: date || transaction.date,
      })
      if (!result.success) {
        setError(firstZodMessage(result.error.issues))
        return
      }
      const data: AddTransactionData = {
        amount: result.data.amount,
        type: result.data.type,
        category: result.data.category,
        description: result.data.description,
        date: result.data.date,
      }
      setSubmitting(true)
      try {
        await onSave(transaction.id, transaction, data)
        onOpenChange(false)
      } catch {
        toast({
          variant: "destructive",
          title: "Something went wrong",
        })
      } finally {
        setSubmitting(false)
      }
    } finally {
      submitLockRef.current = false
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
            Edit Transaction
          </SheetTitle>
        </SheetHeader>
        <div
          className="flex flex-col gap-5 overflow-y-auto px-6 pb-6"
          data-testid="transaction-form"
        >
          {error && (
            <p
              data-testid="validation-error"
              className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div
            data-testid="transaction-type-toggle"
            className="flex gap-2 rounded-xl border border-border bg-muted p-1"
          >
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
            <Label htmlFor="edit-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount
            </Label>
            <Input
              id="edit-amount"
              data-testid="transaction-amount-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted font-serif text-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="edit-category"
                className="h-12 w-full rounded-xl border-border bg-muted text-foreground"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card text-foreground">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title
            </Label>
            <Input
              id="edit-title"
              data-testid="transaction-title-input"
              placeholder="What was this for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </div>

          <div className="retro-divider border-t" />

          <Button
            data-testid="transaction-save-button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(232,133,108,0.2)] active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
