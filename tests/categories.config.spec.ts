import { describe, it, expect } from "vitest"
import {
  EXPENSE_CATEGORIES,
  FALLBACK_CATEGORY_COLOR,
  getCategoryColor,
  INCOME_CATEGORIES,
  resolveCanonicalCategoryName,
} from "@/constants/categories"

describe("EXPENSE_CATEGORIES config", () => {
  it("has unique colors for every expense category", () => {
    const colors = EXPENSE_CATEGORIES.map((c) => c.color)
    expect(new Set(colors).size).toBe(colors.length)
  })

  it("has unique keys", () => {
    const keys = EXPENSE_CATEGORIES.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe("INCOME_CATEGORIES config", () => {
  it("has unique colors for every income category", () => {
    const colors = INCOME_CATEGORIES.map((c) => c.color)
    expect(new Set(colors).size).toBe(colors.length)
  })

  it("has unique keys", () => {
    const keys = INCOME_CATEGORIES.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("maps Salary color for income type", () => {
    expect(getCategoryColor("Salary", "income")).toBe("#4CAF50")
  })
})

describe("resolveCanonicalCategoryName", () => {
  it("maps legacy food alias for expense only", () => {
    expect(resolveCanonicalCategoryName("food", "expense")).toBe("Food & Dining")
  })
})

describe("getCategoryColor", () => {
  it("uses fallback for unknown labels", () => {
    expect(getCategoryColor("Totally Unknown Custom", "expense")).toBe(
      FALLBACK_CATEGORY_COLOR
    )
    expect(getCategoryColor("Totally Unknown Custom", "income")).toBe(
      FALLBACK_CATEGORY_COLOR
    )
  })

  it("disambiguates Family Support by transaction type", () => {
    const expenseColor = getCategoryColor("Family Support", "expense")
    const incomeColor = getCategoryColor("Family Support", "income")
    expect(expenseColor).toBe("#D4A89A")
    expect(incomeColor).toBe("#7CB342")
    expect(expenseColor).not.toBe(incomeColor)
  })
})
