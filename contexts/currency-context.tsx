"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY_ID,
  getCurrencyByCode,
  type CurrencyId,
} from "@/lib/currency"

const STORAGE_KEY = "piggy-currency"

interface CurrencyContextValue {
  currencyId: CurrencyId
  symbol: string
  label: string
  setCurrency: (id: CurrencyId) => void
  formatAmount: (amount: number) => string
  formatWithSymbol: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function loadStoredCurrency(): CurrencyId {
  if (typeof window === "undefined") return DEFAULT_CURRENCY_ID
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyId | null
    if (stored && CURRENCY_OPTIONS.some((c) => c.id === stored)) {
      return stored
    }
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY_ID
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyId, setCurrencyId] = useState<CurrencyId>(DEFAULT_CURRENCY_ID)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCurrencyId(loadStoredCurrency())
    setMounted(true)
  }, [])

  const setCurrency = useCallback((id: CurrencyId) => {
    setCurrencyId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignore
    }
  }, [])

  const currency = getCurrencyByCode(currencyId)

  const formatAmount = useCallback(
    (amount: number) => {
      return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },
    []
  )

  const formatWithSymbol = useCallback(
    (amount: number) => {
      return `${currency.symbol}${formatAmount(amount)}`
    },
    [currency.symbol, formatAmount]
  )

  // Avoid hydration mismatch: use default until mounted
  const value = mounted
    ? {
        currencyId,
        symbol: currency.symbol,
        label: currency.label,
        setCurrency,
        formatAmount,
        formatWithSymbol,
      }
    : {
        currencyId: DEFAULT_CURRENCY_ID,
        symbol: getCurrencyByCode(DEFAULT_CURRENCY_ID).symbol,
        label: getCurrencyByCode(DEFAULT_CURRENCY_ID).label,
        setCurrency,
        formatAmount,
        formatWithSymbol,
      }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return ctx
}
