"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import type { Account, Screen } from "@/lib/types"
import type { User } from "firebase/auth"
import { BalanceCard } from "@/components/balance-card"
import { AccountCard } from "@/components/account-card"

interface DashboardScreenProps {
  accounts: Account[]
  accountsLoading?: boolean
  user?: User | null
  onNavigate: (screen: Screen) => void
  onSelectAccount: (account: Account) => void
}

export function DashboardScreen({
  accounts,
  accountsLoading = false,
  user,
  onNavigate,
  onSelectAccount,
}: DashboardScreenProps) {
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "there"
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-6 pb-5 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        {/* Bottom border line on header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3.5">
            <div className="animate-wiggle size-12 overflow-hidden rounded-full border-2 border-primary/30 shadow-[0_0_14px_-2px_#F2826A40]">
              <Image
                src="/images/piggy-hero.jpg"
                alt="Piggy mascot"
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-foreground">
                Hi, {displayName}
              </h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {"Let's manage your money"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 pt-2">
        <BalanceCard totalBalance={totalBalance} />

        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Your Accounts
          </h2>
          <button
            onClick={() => onNavigate("create-account")}
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-3.5 py-1.5 text-xs font-bold text-primary shadow-[0_0_10px_-2px_#F2826A30] transition-all hover:border-primary/60 hover:bg-primary/18 active:scale-[0.97]"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {accountsLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading accounts…</p>
          ) : (
            accounts.map((account, i) => (
              <div key={account.id} className={`animate-retro-in stagger-${i + 2}`}>
                <AccountCard
                  account={account}
                  onClick={onSelectAccount}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
