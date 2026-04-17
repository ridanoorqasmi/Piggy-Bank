"use client"

import { useState, useRef, useMemo } from "react"
import { ArrowLeft, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { Account, Transaction } from "@/lib/types"
import { useCurrency } from "@/contexts/currency-context"
import { categoryColors } from "@/lib/data"
import { calculateAccountFinancials } from "@/lib/account-financials"
import { TransactionItem } from "@/components/transaction-item"
import { AddTransactionModal, type AddTransactionData } from "@/components/add-transaction-modal"
import { EditTransactionModal } from "@/components/edit-transaction-modal"
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface AccountDetailScreenProps {
  account: Account
  transactions: Transaction[]
  onBack: () => void
  onAddTransaction: (accountId: string, data: AddTransactionData) => Promise<void>
  onUpdateTransaction: (
    transactionId: string,
    previous: Pick<Transaction, "accountId" | "amount" | "type">,
    data: AddTransactionData
  ) => Promise<void>
  onDeleteTransaction: (transaction: Transaction) => Promise<void>
  onEdit: () => void
  onDelete: () => Promise<void>
}

export function AccountDetailScreen({
  account,
  transactions,
  onBack,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onEdit,
  onDelete,
}: AccountDetailScreenProps) {
  const { formatWithSymbol } = useCurrency()
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState(false)
  const deleteTxLockRef = useRef(false)
  const accountTransactions = useMemo(
    () => transactions.filter((t) => t.accountId === account.id),
    [transactions, account.id]
  )

  /** Shared financial derivation — same helper powers the dashboard card. */
  const financials = useMemo(
    () => calculateAccountFinancials(account, transactions),
    [account, transactions]
  )

  const categoryData = accountTransactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] ?? "#B8A08A",
  }))

  return (
    <div className="min-h-dvh bg-background pb-24 sm:pb-28">
      <header className="sticky top-0 z-30 bg-background/95 px-4 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-2 pt-4 sm:pt-6">
          <button
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center font-serif text-lg text-foreground sm:text-left sm:text-xl">
            {account.name}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label="Account options"
              >
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="size-4" />
                Edit account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Account Summary Card */}
        <div className="retro-card retro-noise animate-retro-in stagger-1 rounded-2xl bg-card p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original</p>
              <p className="mt-0.5 truncate font-serif text-base text-foreground sm:text-lg">
                {formatWithSymbol(account.originalAmount)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">In Bank</p>
              <p className="mt-0.5 truncate font-serif text-base text-piggy-success sm:text-lg">
                <span data-testid="account-balance">{formatWithSymbol(financials.currentBalance)}</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Spent</p>
              <p className="mt-0.5 truncate font-serif text-base text-primary sm:text-lg">
                {formatWithSymbol(financials.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="retro-card retro-noise animate-retro-in stagger-2 rounded-2xl bg-card p-4 sm:p-6">
            <h3 className="mb-3 font-serif text-sm text-foreground sm:mb-4 sm:text-base">Spending by Category</h3>
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#241E18",
                      border: "1px solid #3A302A",
                      borderRadius: "12px",
                      color: "#F5E6D3",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatWithSymbol(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="retro-divider mt-4 border-t" />
            <div className="mt-4 flex flex-wrap gap-3">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="retro-card retro-noise animate-retro-in stagger-3 rounded-2xl bg-card p-4 sm:p-6">
          <h3 className="mb-2 font-serif text-sm text-foreground sm:text-base">Transactions</h3>
          <div className="divide-y divide-dashed divide-border/60">
            {accountTransactions.length > 0 ? (
              accountTransactions.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onEdit={(tx) => setEditingTransaction(tx)}
                  onDelete={(tx) => setTransactionToDelete(tx)}
                />
              ))
            ) : (
              <p
                data-testid="empty-transactions-state"
                className="py-6 text-center text-sm text-muted-foreground sm:py-8"
              >
                No transactions yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button - responsive position */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-4 z-40 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(232,133,108,0.3)] transition-all hover:shadow-[0_4px_32px_rgba(232,133,108,0.4)] active:scale-95 sm:right-6 sm:size-14 bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:bottom-[max(2rem,env(safe-area-inset-bottom))]"
        aria-label="Add expense"
      >
        <Plus className="size-5 sm:size-6" />
      </button>

      <AddTransactionModal
        accountId={account.id}
        open={showModal}
        onOpenChange={setShowModal}
        onSave={onAddTransaction}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null)
        }}
        onSave={onUpdateTransaction}
      />

      <AlertDialog
        open={transactionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTransactionToDelete(null)
            setDeletingTransaction(false)
          }
        }}
      >
        <AlertDialogContent className="max-h-[85dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-border bg-card sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-base sm:text-lg">
              Are you sure you want to delete this transaction?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-testid="cancel-delete-button"
              disabled={deletingTransaction}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete-button"
              onClick={async (e) => {
                e.preventDefault()
                if (!transactionToDelete || deleteTxLockRef.current) return
                deleteTxLockRef.current = true
                setDeletingTransaction(true)
                try {
                  await onDeleteTransaction(transactionToDelete)
                  setTransactionToDelete(null)
                } catch {
                  toast({
                    variant: "destructive",
                    title: "Something went wrong",
                  })
                } finally {
                  setDeletingTransaction(false)
                  deleteTxLockRef.current = false
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTransaction ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open)
          if (!open) setDeleteError(null)
        }}
      >
        <AlertDialogContent className="max-h-[85dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-border bg-card sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-base sm:text-lg">
              Delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will permanently delete &quot;{account.name}&quot; and all its
              transactions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault()
                setDeleting(true)
                try {
                  await onDelete()
                  setShowDeleteConfirm(false)
                } catch (err) {
                  setDeleteError(
                    err instanceof Error ? err.message : "Failed to delete account"
                  )
                } finally {
                  setDeleting(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
