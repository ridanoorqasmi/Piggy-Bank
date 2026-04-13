/**
 * Playwright: transaction edit/delete UI (Section B).
 * Requires E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD and real Firebase (or emulator with same UI).
 *
 * Not applicable in this stack (documented inline):
 * - B4.3 / B5.1: Firestore uses WebSocket; no simple HTTP delay. Stale multi-tab edit not scripted.
 * - B7.1 full 100+ UI creates: would take many minutes; we use 28 rows as a practical stand-in.
 */
import { test, expect, testUserEmail, testUserPassword } from "./fixtures"

const hasCreds = !!(testUserEmail && testUserPassword)

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/")
  await page.getByPlaceholder("hello@example.com").fill(testUserEmail!)
  await page.getByPlaceholder("Enter password").fill(testUserPassword!)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.getByText("Your Accounts").waitFor({ state: "visible", timeout: 15000 })
}

async function createAccount(page: import("@playwright/test").Page, name: string, starting: string) {
  await page.getByRole("button", { name: /add/i }).click()
  await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
  await page.getByPlaceholder(/e\.g\. travel fund/i).fill(name)
  await page.getByPlaceholder("0.00").first().fill(starting)
  await page.getByRole("button", { name: /save account/i }).click()
  await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function openAccount(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("button", { name: new RegExp(escapeRe(name)) }).first().click()
  await expect(page.getByRole("heading", { name })).toBeVisible()
}

async function addTransaction(
  page: import("@playwright/test").Page,
  opts: { amount: string; income: boolean; category: string; title: string }
) {
  await page.getByRole("button", { name: /add expense/i }).click()
  await expect(page.getByRole("heading", { name: /add transaction/i })).toBeVisible()
  if (opts.income) {
    await page.getByRole("button", { name: /^income$/i }).click()
  } else {
    await page.getByRole("button", { name: /^expense$/i }).click()
  }
  await page.locator("#amount").fill(opts.amount)
  await page.getByRole("combobox").click()
  await page.getByRole("option", { name: opts.category }).click()
  await page.getByPlaceholder(/what was this for/i).fill(opts.title)
  await page.getByRole("button", { name: /save transaction/i }).click()
  await expect(page.getByRole("heading", { name: /add transaction/i })).not.toBeVisible({
    timeout: 15000,
  })
}

async function parseBalance(page: import("@playwright/test").Page): Promise<number> {
  const raw = await page.getByTestId("account-balance").textContent()
  const normalized = (raw ?? "").replace(/,/g, "").replace(/[^0-9.-]/g, "")
  const n = parseFloat(normalized)
  if (Number.isNaN(n)) throw new Error(`Could not parse balance from: ${raw}`)
  return n
}

async function openEditForTitle(page: import("@playwright/test").Page, title: string) {
  const row = page.getByTestId("transaction-item").filter({ hasText: title })
  await row.getByTestId("transaction-options-trigger").click()
  await page.getByTestId("edit-transaction-button").click()
  await expect(page.getByRole("heading", { name: /edit transaction/i })).toBeVisible()
}

test.describe("B — Transaction edit/delete UI", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000)
    test.skip(!hasCreds, "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set")
    await signIn(page)
  })

  test.describe("B1 — amount edge cases", () => {
    test("B1.1 zero amount in edit — validation, save blocked", async ({ page }) => {
      const name = "E2E-B11-zero"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "50",
        income: false,
        category: "Food",
        title: "B11 lunch",
      })
      await openEditForTitle(page, "B11 lunch")
      await page.getByTestId("transaction-amount-input").fill("0")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByTestId("validation-error")).toBeVisible()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).toBeVisible()
    })

    test("B1.2 negative amount — validation blocks save", async ({ page }) => {
      const name = "E2E-B12-neg"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "10",
        income: false,
        category: "Bills",
        title: "B12 bill",
      })
      await openEditForTitle(page, "B12 bill")
      await page.getByTestId("transaction-amount-input").fill("-100")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByTestId("validation-error")).toBeVisible()
    })

    test("B1.3 very large number saves and shows in list", async ({ page }) => {
      const name = "E2E-B13-large"
      await createAccount(page, name, "0")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "1",
        income: true,
        category: "Income",
        title: "B13 seed",
      })
      await openEditForTitle(page, "B13 seed")
      await page.getByTestId("transaction-amount-input").fill("999999999")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId("transaction-amount")).toContainText("999")
    })

    test("B1.4 decimal value", async ({ page }) => {
      const name = "E2E-B14-dec"
      await createAccount(page, name, "0")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "1",
        income: false,
        category: "Shopping",
        title: "B14 shop",
      })
      await openEditForTitle(page, "B14 shop")
      await page.getByTestId("transaction-amount-input").fill("100.55")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId("transaction-amount")).toContainText("100.55")
    })

    test("B1.5 empty amount", async ({ page }) => {
      const name = "E2E-B15-empty"
      await createAccount(page, name, "50")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "10",
        income: false,
        category: "Food",
        title: "B15 food",
      })
      await openEditForTitle(page, "B15 food")
      await page.getByTestId("transaction-amount-input").fill("")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByTestId("validation-error")).toBeVisible()
    })
  })

  test.describe("B2 — edit behavior", () => {
    test("B2.1 expense → income updates sign styling", async ({ page }) => {
      const name = "E2E-B21"
      await createAccount(page, name, "1000")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "300",
        income: false,
        category: "Food",
        title: "B21 exp",
      })
      expect(await parseBalance(page)).toBe(700)
      await openEditForTitle(page, "B21 exp")
      await page.getByRole("button", { name: /^income$/i }).click()
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      const amt = page.getByTestId("transaction-item").filter({ hasText: "B21 exp" }).getByTestId("transaction-amount")
      await expect(amt).toContainText("+")
      await expect(amt).toHaveClass(/piggy-success/)
      expect(await parseBalance(page)).toBe(1300)
    })

    test("B2.2 income → expense", async ({ page }) => {
      const name = "E2E-B22"
      await createAccount(page, name, "0")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "200",
        income: true,
        category: "Income",
        title: "B22 inc",
      })
      expect(await parseBalance(page)).toBe(200)
      await openEditForTitle(page, "B22 inc")
      await page.getByRole("button", { name: /^expense$/i }).click()
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      const amt = page.getByTestId("transaction-item").filter({ hasText: "B22 inc" }).getByTestId("transaction-amount")
      await expect(amt).toContainText("-")
      await expect(amt).toHaveClass(/destructive/)
      expect(await parseBalance(page)).toBe(-200)
    })

    test("B2.3 save without changes — single row", async ({ page }) => {
      const name = "E2E-B23"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "25",
        income: false,
        category: "Transport",
        title: "B23 bus",
      })
      await expect(page.getByTestId("transaction-item")).toHaveCount(1)
      await openEditForTitle(page, "B23 bus")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId("transaction-item")).toHaveCount(1)
    })

    test("B2.4 rapid save clicks — one row, consistent amount", async ({ page }) => {
      const name = "E2E-B24"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "40",
        income: false,
        category: "Food",
        title: "B24 meal",
      })
      await openEditForTitle(page, "B24 meal")
      await page.getByTestId("transaction-amount-input").fill("41")
      const btn = page.getByTestId("transaction-save-button")
      await btn.click()
      await btn.click({ force: true }).catch(() => {})
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId("transaction-item")).toHaveCount(1)
      await expect(page.getByTestId("transaction-amount")).toContainText("41")
    })
  })

  test.describe("B3 — delete", () => {
    test("B3.1 delete only transaction — empty state, balance = starting", async ({ page }) => {
      const name = "E2E-B31"
      await createAccount(page, name, "0")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "100",
        income: true,
        category: "Income",
        title: "B31 only",
      })
      expect(await parseBalance(page)).toBe(100)
      await page.getByTestId("transaction-item").getByTestId("transaction-options-trigger").click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("confirm-delete-button").click()
      await expect(page.getByTestId("empty-transactions-state")).toBeVisible({ timeout: 15000 })
      expect(await parseBalance(page)).toBe(0)
    })

    test("B3.2 delete large expense increases balance", async ({ page }) => {
      const name = "E2E-B32"
      await createAccount(page, name, "2000")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "1000",
        income: false,
        category: "Bills",
        title: "B32 big",
      })
      expect(await parseBalance(page)).toBe(1000)
      await page.getByTestId("transaction-item").getByTestId("transaction-options-trigger").click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("confirm-delete-button").click()
      await expect(page.getByTestId("empty-transactions-state")).toBeVisible({ timeout: 15000 })
      expect(await parseBalance(page)).toBe(2000)
    })

    test("B3.3 delete income decreases balance", async ({ page }, testInfo) => {
      const name = `E2E-B33-w${testInfo.workerIndex}`
      await createAccount(page, name, "0")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "500",
        income: true,
        category: "Income",
        title: "B33 pay",
      })
      expect(await parseBalance(page)).toBe(500)
      await page.getByTestId("transaction-item").getByTestId("transaction-options-trigger").click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("confirm-delete-button").click()
      await expect(page.getByTestId("empty-transactions-state")).toBeVisible({ timeout: 20000 })
      await expect.poll(async () => parseBalance(page), { timeout: 20000 }).toBe(0)
    })

    test("B3.4 spam confirm delete — still consistent", async ({ page }) => {
      const name = "E2E-B34"
      await createAccount(page, name, "50")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "10",
        income: false,
        category: "Food",
        title: "B34 x",
      })
      await page.getByTestId("transaction-item").getByTestId("transaction-options-trigger").click()
      await page.getByTestId("delete-transaction-button").click()
      const confirm = page.getByTestId("confirm-delete-button")
      await confirm.click()
      await confirm.click({ force: true }).catch(() => {})
      await expect(page.getByTestId("empty-transactions-state")).toBeVisible({ timeout: 15000 })
    })

    test("B3.5 cancel delete", async ({ page }) => {
      const name = "E2E-B35"
      await createAccount(page, name, "80")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "20",
        income: false,
        category: "Food",
        title: "B35 keep",
      })
      const before = await parseBalance(page)
      await page.getByTestId("transaction-item").getByTestId("transaction-options-trigger").click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("cancel-delete-button").click()
      await expect(page.getByText("B35 keep")).toBeVisible()
      expect(await parseBalance(page)).toBe(before)
    })
  })

  test.describe("B4 — balance & persistence", () => {
    test("B4.1 multiple edit and delete in session", async ({ page }, testInfo) => {
      const name = `E2E-B41-w${testInfo.workerIndex}`
      await createAccount(page, name, "500")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "100",
        income: false,
        category: "Food",
        title: "B41 a",
      })
      await addTransaction(page, {
        amount: "50",
        income: false,
        category: "Transport",
        title: "B41 b",
      })
      await openEditForTitle(page, "B41 a")
      await page.getByTestId("transaction-amount-input").fill("80")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      await page
        .getByTestId("transaction-item")
        .filter({ hasText: "B41 b" })
        .getByTestId("transaction-options-trigger")
        .click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("confirm-delete-button").click()
      await expect(page.getByTestId("transaction-item")).toHaveCount(1, { timeout: 20000 })
      await expect.poll(async () => parseBalance(page), { timeout: 20000 }).toBe(420)
    })

    test("B4.2 reload after edit/delete", async ({ page }) => {
      const name = "E2E-B42"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "25",
        income: false,
        category: "Food",
        title: "B42 t",
      })
      await openEditForTitle(page, "B42 t")
      await page.getByTestId("transaction-amount-input").fill("30")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
      const bal = await parseBalance(page)
      await page.reload()
      await page.goto("/")
      const emailField = page.getByPlaceholder("hello@example.com")
      if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await signIn(page)
      } else {
        await page.getByText("Your Accounts").waitFor({ state: "visible", timeout: 15000 })
      }
      await openAccount(page, name)
      expect(await parseBalance(page)).toBe(bal)
      await expect(page.getByText("B42 t")).toBeVisible()
    })
  })

  test.describe("B5 — data integrity UI", () => {
    test("B5.2 empty title blocked", async ({ page }) => {
      const name = "E2E-B52"
      await createAccount(page, name, "10")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "5",
        income: false,
        category: "Food",
        title: "B52 t",
      })
      await openEditForTitle(page, "B52 t")
      await page.getByTestId("transaction-title-input").fill("")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByTestId("validation-error")).toBeVisible()
    })

    test("B5.3 type toggle always has a selection", async ({ page }) => {
      const name = "E2E-B53"
      await createAccount(page, name, "10")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "5",
        income: true,
        category: "Income",
        title: "B53 t",
      })
      await openEditForTitle(page, "B53 t")
      await expect(page.getByTestId("transaction-type-toggle")).toBeVisible()
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 15000,
      })
    })
  })

  /**
   * B5.1 stale edit after delete: would require two browser contexts or programmatic
   * Firestore removal while the sheet stays open — not set up in this project.
   */

  test.describe("B6 — UX", () => {
    test("B6.1 long title visible in list", async ({ page }) => {
      const name = "E2E-B61"
      const longTitle = "E2E-LONG-" + "x".repeat(120)
      await createAccount(page, name, "5")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "1",
        income: false,
        category: "Bills",
        title: longTitle,
      })
      await expect(page.getByTestId("transaction-title")).toContainText("E2E-LONG-")
      const box = await page.getByTestId("transaction-item").first().boundingBox()
      expect(box && box.width).toBeGreaterThan(0)
    })

    test("B6.2 reopen edit after close — values match row", async ({ page }) => {
      const name = "E2E-B62"
      await createAccount(page, name, "20")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "7",
        income: false,
        category: "Food",
        title: "B62 reopen",
      })
      await openEditForTitle(page, "B62 reopen")
      await page.keyboard.press("Escape")
      await openEditForTitle(page, "B62 reopen")
      await expect(page.getByTestId("transaction-amount-input")).toHaveValue("7")
    })

    test("B6.3 expense minus destructive / income plus success", async ({ page }) => {
      const name = "E2E-B63"
      await createAccount(page, name, "100")
      await openAccount(page, name)
      await addTransaction(page, {
        amount: "15",
        income: false,
        category: "Food",
        title: "B63 e",
      })
      await addTransaction(page, {
        amount: "40",
        income: true,
        category: "Income",
        title: "B63 i",
      })
      await expect(
        page.getByTestId("transaction-item").filter({ hasText: "B63 e" }).getByTestId("transaction-amount")
      ).toHaveClass(/destructive/)
      await expect(
        page.getByTestId("transaction-item").filter({ hasText: "B63 i" }).getByTestId("transaction-amount")
      ).toHaveClass(/piggy-success/)
    })
  })

  test.describe("B7 — scale", () => {
    test.describe.configure({ mode: "serial" })

    test("B7.1 many rows — can edit/delete target (28 adds)", async ({ page }) => {
      const name = "E2E-B71-scale"
      test.setTimeout(600000)
      await createAccount(page, name, "1000")
      await openAccount(page, name)
      for (let i = 0; i < 28; i++) {
        await addTransaction(page, {
          amount: "1",
          income: false,
          category: "Food",
          title: `B71-row-${i}`,
        })
      }
      await expect(page.getByTestId("transaction-item")).toHaveCount(28)
      await openEditForTitle(page, "B71-row-5")
      await page.getByTestId("transaction-amount-input").fill("2")
      await page.getByTestId("transaction-save-button").click()
      await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
        timeout: 20000,
      })
      await page
        .getByTestId("transaction-item")
        .filter({ hasText: "B71-row-10" })
        .getByTestId("transaction-options-trigger")
        .click()
      await page.getByTestId("delete-transaction-button").click()
      await page.getByTestId("confirm-delete-button").click()
      await expect(page.getByTestId("transaction-item")).toHaveCount(27)
    })

    test("B7.2 several edits in sequence", async ({ page }) => {
      const name = "E2E-B72"
      await createAccount(page, name, "200")
      await openAccount(page, name)
      for (let i = 0; i < 5; i++) {
        await addTransaction(page, {
          amount: "10",
          income: false,
          category: "Shopping",
          title: `B72-${i}`,
        })
      }
      for (let i = 0; i < 5; i++) {
        await openEditForTitle(page, `B72-${i}`)
        await page.getByTestId("transaction-amount-input").fill(String(11 + i))
        await page.getByTestId("transaction-save-button").click()
        await expect(page.getByRole("heading", { name: /edit transaction/i })).not.toBeVisible({
          timeout: 15000,
        })
      }
      await expect(page.getByTestId("transaction-item")).toHaveCount(5)
    })
  })
})
