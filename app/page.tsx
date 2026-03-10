"use client"

import { useState } from "react"
import type { Account, Screen } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { BottomNav } from "@/components/bottom-nav"
import { AuthScreen } from "@/components/screens/auth-screen"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { CreateAccountScreen } from "@/components/screens/create-account-screen"
import { EditAccountScreen } from "@/components/screens/edit-account-screen"
import { AccountDetailScreen } from "@/components/screens/account-detail-screen"
import { InsightsScreen } from "@/components/screens/insights-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"

export default function Home() {
  const { user, loading, error, setError, signIn, signUp, signOut } = useAuth()
  const { accounts, loading: accountsLoading, createAccount, updateAccount, deleteAccount } =
    useAccounts(user?.uid)
  const { transactions, addTransaction, deleteTransactionsByAccountId } =
    useTransactions(user?.uid)
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  function handleSelectAccount(account: Account) {
    setSelectedAccount(account)
    setScreen("account-detail")
  }

  function handleNavigate(target: Screen) {
    setScreen(target)
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        error={error}
        onClearError={() => setError(null)}
        isLoading={loading}
      />
    )
  }

  const showBottomNav =
    screen === "dashboard" || screen === "insights" || screen === "profile"

  return (
    <div className="mx-auto max-w-md">
      {screen === "dashboard" && (
        <DashboardScreen
          accounts={accounts}
          accountsLoading={accountsLoading}
          user={user}
          onNavigate={handleNavigate}
          onSelectAccount={handleSelectAccount}
        />
      )}

      {screen === "create-account" && (
        <CreateAccountScreen
          onBack={() => setScreen("dashboard")}
          onCreateAccount={async (data) => {
            await createAccount(data)
            setScreen("dashboard")
          }}
        />
      )}

      {screen === "edit-account" && selectedAccount && (
        <EditAccountScreen
          account={
            accounts.find((a) => a.id === selectedAccount.id) ?? selectedAccount
          }
          onBack={() => setScreen("account-detail")}
          onUpdateAccount={async (accountId, data) => {
            await updateAccount(accountId, data)
            setSelectedAccount((prev) =>
              prev && prev.id === accountId ? { ...prev, ...data } : prev
            )
            setScreen("account-detail")
          }}
        />
      )}

      {screen === "account-detail" && selectedAccount && (
        <AccountDetailScreen
          account={
            accounts.find((a) => a.id === selectedAccount.id) ?? selectedAccount
          }
          transactions={transactions}
          onBack={() => setScreen("dashboard")}
          onAddTransaction={addTransaction}
          onEdit={() => setScreen("edit-account")}
          onDelete={async () => {
            deleteTransactionsByAccountId(selectedAccount.id) // fire-and-forget
            deleteAccount(selectedAccount.id) // fire-and-forget
            setSelectedAccount(null)
            setScreen("dashboard")
          }}
        />
      )}

      {screen === "insights" && (
        <InsightsScreen transactions={transactions} />
      )}

      {screen === "profile" && (
        <ProfileScreen user={user} accounts={accounts} onLogout={signOut} />
      )}

      {showBottomNav && (
        <BottomNav activeScreen={screen} onNavigate={handleNavigate} />
      )}
    </div>
  )
}
