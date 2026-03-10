"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CurrencySheet } from "@/components/currency-sheet"
import { useCurrency } from "@/contexts/currency-context"
import type { User } from "firebase/auth"
import type { Account } from "@/lib/types"

interface ProfileScreenProps {
  user?: User | null
  accounts: Account[]
  onLogout: () => void
}

export function ProfileScreen({ user, accounts, onLogout }: ProfileScreenProps) {
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false)
  const { symbol, label } = useCurrency()
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "User"
  const email = user?.email ?? ""
  const initial = displayName.charAt(0).toUpperCase()
  const accountCount = accounts.length
  const goalsCount = accounts.filter((a) => a.type === "saving").length

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-6 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="pt-6">
          <h1 className="font-serif text-2xl text-foreground">Profile</h1>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6">
        {/* Avatar Section with mascot */}
        <div className="retro-card retro-noise animate-retro-in stagger-1 flex flex-col items-center gap-3 rounded-2xl bg-card p-8">
          <div className="relative">
            <div className="size-24 overflow-hidden rounded-full border-2 border-primary/20">
              <Image
                src="/images/piggy-profile.jpg"
                alt="Your piggy avatar"
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary font-serif text-xs font-bold text-primary-foreground">
              {initial}
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-serif text-xl text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground">{email || "—"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: String(accountCount), label: "Accounts", className: "text-foreground" },
            { value: String(goalsCount), label: "Goals", className: "text-piggy-success" },
          ].map((stat, i) => (
            <div key={stat.label} className={`retro-card retro-noise animate-retro-in stagger-${i + 2} rounded-2xl bg-card p-4 text-center`}>
              <p className={`font-serif text-2xl ${stat.className}`}>{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings items */}
        <div className="retro-card retro-noise animate-retro-in stagger-5 rounded-2xl bg-card">
          <button
            className="flex w-full items-center justify-between border-b border-dashed border-border/60 px-6 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
            onClick={() => setCurrencySheetOpen(true)}
          >
            Currency
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">{symbol} ({label})</span>
              <ArrowLeft className="size-4 rotate-180 text-muted-foreground" />
            </span>
          </button>
          {["Notifications", "Categories", "Export Data"].map((item, i, arr) => (
            <button
              key={item}
              className={`flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 ${
                i < arr.length - 1 ? "border-b border-dashed border-border/60" : ""
              }`}
            >
              <span className="flex flex-col items-start gap-0.5">
                <span>{item}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Coming soon
                </span>
              </span>
              <ArrowLeft className="size-4 rotate-180 text-muted-foreground opacity-70" />
            </button>
          ))}
        </div>

        <CurrencySheet
          open={currencySheetOpen}
          onOpenChange={setCurrencySheetOpen}
        />

        <Button
          variant="outline"
          onClick={onLogout}
          className="h-12 rounded-xl border-border bg-card text-sm font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
