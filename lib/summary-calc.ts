/**
 * Signed-amount summary: amount > 0 counts as income, amount < 0 as expense (spent uses absolute value).
 */
export function calculateSummary(
  original: number,
  transactions: { amount: number }[]
): { spent: number; income: number; inBank: number } {
  let income = 0
  let spent = 0
  for (const t of transactions) {
    if (t.amount > 0) income += t.amount
    else if (t.amount < 0) spent += Math.abs(t.amount)
  }
  return {
    spent,
    income,
    inBank: original + income - spent,
  }
}
