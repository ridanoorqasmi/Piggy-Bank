"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Account } from "@/lib/types"
import { createAccountSchema } from "@/lib/validations"

interface CreateAccountScreenProps {
  onBack: () => void
  onCreateAccount: (data: Omit<Account, "id">) => Promise<Account | void>
}

const colorOptions = [
  "#E8856C",
  "#C9A87C",
  "#8DB580",
  "#D4A843",
  "#7EAEB8",
  "#D9534F",
]

export function CreateAccountScreen({ onBack, onCreateAccount }: CreateAccountScreenProps) {
  const [accountType, setAccountType] = useState<"spending" | "saving">("spending")
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [name, setName] = useState("")
  const [startingAmount, setStartingAmount] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [goalError, setGoalError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [negativeAmountDialogOpen, setNegativeAmountDialogOpen] = useState(false)

  function applyZodFieldErrors(
    issues: { path: (string | number)[]; message: string }[]
  ) {
    let nextName: string | null = null
    let nextAmount: string | null = null
    let nextGoal: string | null = null
    for (const issue of issues) {
      const key = issue.path[0]
      if (key === "name") nextName = issue.message
      else if (key === "balance" || key === "originalAmount")
        nextAmount = "Starting amount cannot be negative."
      else if (key === "goalAmount") nextGoal = issue.message
    }
    setNameError(nextName)
    setAmountError(nextAmount)
    setGoalError(nextGoal)
    if (!nextName && !nextAmount && !nextGoal && issues[0]) {
      setSaveError(issues[0].message)
    }
  }

  async function handleSave() {
    setNameError(null)
    setAmountError(null)
    setGoalError(null)
    setSaveError(null)

    const rawAmount = startingAmount.trim()
    const parsedAmount = rawAmount === "" ? 0 : Number.parseFloat(rawAmount)
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0

    if (Number.isFinite(parsedAmount) && parsedAmount < 0) {
      setAmountError("Starting amount cannot be negative.")
      setNegativeAmountDialogOpen(true)
      return
    }

    const goal =
      accountType === "saving" && goalAmount.trim() !== ""
        ? Number.parseFloat(goalAmount)
        : undefined
    const result = createAccountSchema.safeParse({
      name: name.trim(),
      type: accountType,
      balance: amount,
      originalAmount: amount,
      totalSpend: 0,
      goalAmount: accountType === "saving" ? goal : undefined,
      color: selectedColor,
    })
    if (!result.success) {
      applyZodFieldErrors(result.error.issues)
      return
    }
    setSubmitting(true)
    try {
      await onCreateAccount({
        name: result.data.name,
        type: result.data.type,
        balance: result.data.balance,
        originalAmount: result.data.originalAmount,
        totalSpend: result.data.totalSpend,
        goalAmount: result.data.goalAmount,
        color: result.data.color,
      })
      onBack()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to create account")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-6 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="flex items-center gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-serif text-xl text-foreground">Create Account</h1>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6">
        <div className="animate-retro-in stagger-1 flex flex-col gap-2">
          <Label
            htmlFor="create-account-name"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Account Name
          </Label>
          <Input
            id="create-account-name"
            placeholder="e.g. Travel Fund"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(null)
            }}
            className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "create-account-name-error" : undefined}
          />
          {nameError && (
            <p id="create-account-name-error" className="text-xs text-destructive">
              {nameError}
            </p>
          )}
        </div>

        <div className="animate-retro-in stagger-2 flex flex-col gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account Type
          </Label>
          <div className="flex gap-3">
            <button
              onClick={() => setAccountType("spending")}
              className={`flex-1 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                accountType === "spending"
                  ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(232,133,108,0.2)]"
                  : "retro-card bg-card text-muted-foreground"
              }`}
            >
              Spending
            </button>
            <button
              onClick={() => setAccountType("saving")}
              className={`flex-1 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                accountType === "saving"
                  ? "bg-accent text-accent-foreground shadow-[0_0_16px_rgba(201,168,124,0.2)]"
                  : "retro-card bg-card text-muted-foreground"
              }`}
            >
              Saving
            </button>
          </div>
        </div>

        <div className="animate-retro-in stagger-3 flex flex-col gap-2">
          <Label
            htmlFor="create-account-starting-amount"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Starting Amount
          </Label>
          <Input
            id="create-account-starting-amount"
            type="number"
            placeholder="0.00"
            value={startingAmount}
            onChange={(e) => {
              setStartingAmount(e.target.value)
              setAmountError(null)
            }}
            className="h-12 rounded-xl border-border bg-card font-serif text-xl text-foreground placeholder:text-muted-foreground"
            min={0}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={
              amountError
                ? "create-account-starting-amount-error create-account-starting-amount-hint"
                : "create-account-starting-amount-hint"
            }
          />
          {amountError && (
            <p id="create-account-starting-amount-error" className="text-xs text-destructive">
              {amountError}
            </p>
          )}
          <p
            id="create-account-starting-amount-hint"
            className="text-xs text-muted-foreground"
          >
            You can add expenses after creating the account.
          </p>
        </div>

        {accountType === "saving" && (
          <div className="animate-retro-in flex flex-col gap-2">
            <Label
              htmlFor="create-account-goal"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Goal Amount (optional)
            </Label>
            <Input
              id="create-account-goal"
              type="number"
              placeholder="0.00"
              value={goalAmount}
              onChange={(e) => {
                setGoalAmount(e.target.value)
                setGoalError(null)
              }}
              className="h-12 rounded-xl border-border bg-card font-serif text-xl text-foreground placeholder:text-muted-foreground"
              aria-invalid={goalError ? true : undefined}
              aria-describedby={goalError ? "create-account-goal-error" : undefined}
            />
            {goalError && (
              <p id="create-account-goal-error" className="text-xs text-destructive">
                {goalError}
              </p>
            )}
          </div>
        )}

        <div className="animate-retro-in stagger-4 flex flex-col gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Color
          </Label>
          <div className="flex gap-3">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`size-10 rounded-full transition-all ${
                  selectedColor === color
                    ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "ring-1 ring-border"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: selectedColor === color ? `0 0 12px ${color}40` : undefined,
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {saveError && (
          <p className="animate-retro-in stagger-5 text-xs text-destructive">{saveError}</p>
        )}
        <Button
          onClick={handleSave}
          disabled={submitting}
          className="animate-retro-in stagger-5 mt-4 h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(232,133,108,0.2)] active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Account"}
        </Button>
      </div>

      <AlertDialog open={negativeAmountDialogOpen} onOpenChange={setNegativeAmountDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-xl border-border bg-card sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-base text-foreground sm:text-lg">
              Starting amount can&apos;t be negative
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Use zero or a positive number for this field. After the account exists, you can add
              expenses as transactions to reduce the balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex-col gap-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction className="h-12 w-full rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
