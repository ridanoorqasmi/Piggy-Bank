import { test as base, expect } from "@playwright/test"

const testUserEmail = process.env.E2E_TEST_USER_EMAIL
const testUserPassword = process.env.E2E_TEST_USER_PASSWORD

export async function signIn(page: import("@playwright/test").Page) {
  if (!testUserEmail || !testUserPassword) {
    throw new Error("E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set for sign-in")
  }
  await page.goto("/")
  await page.getByPlaceholder("hello@example.com").fill(testUserEmail)
  await page.getByPlaceholder("Enter password").fill(testUserPassword)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.getByText("Your Accounts").waitFor({ state: "visible", timeout: 15000 })
}

function hasTestUser() {
  return !!(testUserEmail && testUserPassword)
}

export const test = base.extend<{ signedInPage: import("@playwright/test").Page }>({
  signedInPage: async ({ page }, use) => {
    if (hasTestUser()) await signIn(page)
    await use(page)
  },
})

export { expect, testUserEmail, testUserPassword, hasTestUser }
