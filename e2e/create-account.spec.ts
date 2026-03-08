import { test, expect, signIn } from "./fixtures"

test.describe("Create Account", () => {
  test("full flow: sign in -> Add -> create account -> back on dashboard with new account", async ({
    page,
  }) => {
    test.setTimeout(60000)
    const email = process.env.E2E_TEST_USER_EMAIL
    const password = process.env.E2E_TEST_USER_PASSWORD
    test.skip(!email || !password, "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set")

    await signIn(page)
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()

    const accountName = `E2E Account ${Date.now()}`
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("100")
    await page.getByRole("button", { name: /save account/i }).click()

    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 10000 })
  })
})

test.describe("Create Account with fixture", () => {
  test("from dashboard Add -> fill form -> submit -> back on dashboard with new account", async ({
    signedInPage: page,
  }) => {
    test.setTimeout(60000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )
    const accountName = `E2E Fixture ${Date.now()}`
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()

    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("250")
    await page.getByRole("button", { name: /save account/i }).click()

    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 10000 })
  })
})
