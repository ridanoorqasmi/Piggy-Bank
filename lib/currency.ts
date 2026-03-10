export const CURRENCY_OPTIONS = [
  { id: "USD", symbol: "$", label: "US Dollar" },
  { id: "PKR", symbol: "Rs", label: "Pakistani Rupee" },
  { id: "INR", symbol: "₹", label: "Indian Rupee" },
  { id: "JPY", symbol: "¥", label: "Japanese Yen" },
  { id: "EUR", symbol: "€", label: "Euro" },
  { id: "GBP", symbol: "£", label: "British Pound" },
  { id: "AUD", symbol: "A$", label: "Australian Dollar" },
  { id: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { id: "CHF", symbol: "CHF", label: "Swiss Franc" },
  { id: "BRL", symbol: "R$", label: "Brazilian Real" },
  { id: "KRW", symbol: "₩", label: "South Korean Won" },
  { id: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { id: "ZAR", symbol: "R", label: "South African Rand" },
  { id: "SAR", symbol: "SAR", label: "Saudi Riyal" },
  { id: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { id: "PHP", symbol: "₱", label: "Philippine Peso" },
] as const

export type CurrencyId = (typeof CURRENCY_OPTIONS)[number]["id"]

export const DEFAULT_CURRENCY_ID: CurrencyId = "USD"

export function getCurrencyByCode(code: CurrencyId) {
  return CURRENCY_OPTIONS.find((c) => c.id === code) ?? CURRENCY_OPTIONS[0]
}

export function formatAmount(amount: number, symbol: string): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatWithSymbol(amount: number, symbol: string): string {
  return `${symbol}${formatAmount(amount, symbol)}`
}
