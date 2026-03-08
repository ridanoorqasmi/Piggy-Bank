"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    const amount = parseFloat(startingAmount) || 0
    const goal = accountType === "saving" && goalAmount ? parseFloat(goalAmount) : undefined
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
      const first = result.error.flatten().formErrors[0] ?? result.error.message
      setError(first)
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
      setError(e instanceof Error ? e.message : "Failed to create account")
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
        {error && (
          <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <div className="animate-retro-in stagger-1 flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account Name
          </Label>
          <Input
            placeholder="e.g. Travel Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
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
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Starting Amount
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={startingAmount}
            onChange={(e) => setStartingAmount(e.target.value)}
            className="h-12 rounded-xl border-border bg-card font-serif text-xl text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {accountType === "saving" && (
          <div className="animate-retro-in flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goal Amount (optional)
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="h-12 rounded-xl border-border bg-card font-serif text-xl text-foreground placeholder:text-muted-foreground"
            />
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

        <Button
          onClick={handleSave}
          disabled={submitting}
          className="animate-retro-in stagger-5 mt-4 h-12 rounded-xl bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(232,133,108,0.2)] active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Account"}
        </Button>
      </div>
    </div>
  )
}
