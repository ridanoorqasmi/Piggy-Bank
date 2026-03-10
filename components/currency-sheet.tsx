"use client"

import { Check } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CURRENCY_OPTIONS, type CurrencyId } from "@/lib/currency"
import { useCurrency } from "@/contexts/currency-context"

interface CurrencySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CurrencySheet({ open, onOpenChange }: CurrencySheetProps) {
  const { currencyId, setCurrency } = useCurrency()

  function handleSelect(id: CurrencyId) {
    setCurrency(id)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="font-serif text-xl text-foreground">
            Select Currency
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-0 overflow-y-auto px-6 pb-6">
          {CURRENCY_OPTIONS.map((option) => {
            const isSelected = currencyId === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                  isSelected
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg">{option.symbol}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {option.id}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="size-5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
