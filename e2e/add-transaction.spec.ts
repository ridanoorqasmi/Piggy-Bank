import { test, expect } from "./fixtures"

test.describe("Add Transaction", () => {
  test("modal opens and closes after saving transaction", async ({
    signedInPage: page,
  }) => {
    test.setTimeout(90000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    const accountName = `E2E Tx ${Date.now()}`
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("500")
    await page.getByRole("button", { name: /save account/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 5000 })

    await page.getByText(accountName).click()
    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()

    await page.getByRole("button", { name: /add expense/i }).click()
    await expect(page.getByRole("heading", { name: /add transaction/i })).toBeVisible()

    await page.locator("#amount").fill("25.50")
    await page.getByRole("combobox").click()
    await page.getByRole("option", { name: "Food" }).click()
    await page.getByPlaceholder(/what was this for/i).fill("E2E test lunch")
    await page.getByRole("button", { name: /save transaction/i }).click()

    await expect(page.getByRole("heading", { name: /add transaction/i })).not.toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText("E2E test lunch")).toBeVisible({ timeout: 5000 })
  })
})
