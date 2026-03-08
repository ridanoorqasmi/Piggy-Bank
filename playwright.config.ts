import dotenv from "dotenv"
import { defineConfig, devices } from "@playwright/test"

// Load .env.local so E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD are available to tests
dotenv.config({ path: ".env.local" })

const useEmulator = process.env.USE_FIREBASE_EMULATOR === "true"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI && !useEmulator,
    timeout: 120000,
    env: {
      ...process.env,
      ...(useEmulator ? { NEXT_PUBLIC_USE_FIREBASE_EMULATOR: "true" } : {}),
    },
  },
})
