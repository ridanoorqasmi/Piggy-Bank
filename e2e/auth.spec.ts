import { test, expect } from "@playwright/test"

test.describe("Auth", () => {
  test("shows auth screen when not logged in", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: /piggy/i })).toBeVisible()
    await expect(page.getByPlaceholder("hello@example.com")).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("sign in with valid credentials navigates to dashboard", async ({ page }) => {
    const email = process.env.E2E_TEST_USER_EMAIL
    const password = process.env.E2E_TEST_USER_PASSWORD
    test.skip(!email || !password, "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set")

    await page.goto("/")
    await page.getByPlaceholder("hello@example.com").fill(email)
    await page.getByPlaceholder("Enter password").fill(password)
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("button", { name: /add/i })).toBeVisible()
  })

  test("invalid credentials show error and stay on auth screen", async ({ page }) => {
    await page.goto("/")
    await page.getByPlaceholder("hello@example.com").fill("wrong@example.com")
    await page.getByPlaceholder("Enter password").fill("wrongpassword")
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page.getByText(/error|invalid|failed/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByPlaceholder("hello@example.com")).toBeVisible()
  })
})
