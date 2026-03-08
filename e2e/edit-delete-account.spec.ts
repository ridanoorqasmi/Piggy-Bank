import { test, expect, signIn } from "./fixtures"

test.describe("Edit Account", () => {
  test("from dashboard: open account -> Edit -> change name and save -> back to detail with updated name", async ({
    signedInPage: page,
  }) => {
    test.setTimeout(60000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )

    const accountName = `E2E Edit ${Date.now()}`
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("75")
    await page.getByRole("button", { name: /save account/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 10000 })

    await page.getByText(accountName).click()
    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()

    await page.getByRole("button", { name: /account options/i }).click()
    await page.getByRole("menuitem", { name: /edit account/i }).click()
    await expect(page.getByRole("heading", { name: /edit account/i })).toBeVisible()
    await expect(page.getByPlaceholder(/e\.g\. travel fund/i)).toHaveValue(accountName)

    const newName = `${accountName} Updated`
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(newName)
    await page.getByRole("button", { name: /update account/i }).click()

    await expect(page.getByRole("heading", { name: newName })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByText("Original")).toBeVisible()
  })

  test("edit account: change color and type then save", async ({
    signedInPage: page,
  }) => {
    test.setTimeout(60000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )

    const accountName = `E2E Edit Type ${Date.now()}`
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("200")
    await page.getByRole("button", { name: /save account/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await page.getByText(accountName).click()
    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()

    await page.getByRole("button", { name: /account options/i }).click()
    await page.getByRole("menuitem", { name: /edit account/i }).click()
    await expect(page.getByRole("heading", { name: /edit account/i })).toBeVisible()

    await page.getByRole("button", { name: /saving/i }).click()
    await page.getByPlaceholder("0.00").nth(1).fill("500")
    await page.getByRole("button", { name: /update account/i }).click()

    await expect(page.getByRole("heading", { name: accountName })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByText("Original")).toBeVisible()
  })
})

test.describe("Delete Account", () => {
  test("from account detail: Delete -> confirm -> back on dashboard without account", async ({
    signedInPage: page,
  }) => {
    test.setTimeout(60000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )

    const accountName = `E2E Delete ${Date.now()}`
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("10")
    await page.getByRole("button", { name: /save account/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(accountName)).toBeVisible({ timeout: 10000 })

    await page.getByText(accountName).click()
    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()

    await page.getByRole("button", { name: /account options/i }).click()
    await page.getByRole("menuitem", { name: /delete account/i }).click()
    await expect(page.getByRole("heading", { name: /delete this account/i })).toBeVisible()
    await expect(
      page.getByRole("alertdialog").filter({ hasText: accountName })
    ).toBeVisible()

    await page.getByRole("button", { name: /^delete$/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByText(accountName)).not.toBeVisible()
  })

  test("delete account: cancel keeps account", async ({ signedInPage: page }) => {
    test.setTimeout(60000)
    test.skip(
      !process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD,
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set"
    )

    const accountName = `E2E No Delete ${Date.now()}`
    await page.getByRole("button", { name: /add/i }).click()
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await page.getByPlaceholder(/e\.g\. travel fund/i).fill(accountName)
    await page.getByPlaceholder("0.00").first().fill("5")
    await page.getByRole("button", { name: /save account/i }).click()
    await expect(page.getByText("Your Accounts")).toBeVisible({ timeout: 30000 })
    await page.getByText(accountName).click()
    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()

    await page.getByRole("button", { name: /account options/i }).click()
    await page.getByRole("menuitem", { name: /delete account/i }).click()
    await expect(page.getByRole("heading", { name: /delete this account/i })).toBeVisible()
    await page.getByRole("button", { name: /cancel/i }).click()

    await expect(page.getByRole("heading", { name: accountName })).toBeVisible()
  })
})
