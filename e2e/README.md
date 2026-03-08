# E2E tests (Playwright)

End-to-end tests for the Piggy Bank app. They run against a real dev server. You can run them against **real Firebase** or against the **Firebase Emulator** (recommended for reliable create-account / navigation tests).

## Prerequisites

- **For real Firebase:** Firebase project with Email/Password auth enabled and a test user. `.env.local` with valid Firebase config.
- **For emulator (recommended):** Same `.env.local` (used for app config); `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD` in `.env.local` for the test user that will be created in the emulator. Firebase CLI is used via the project’s `firebase-tools` devDependency.

## Running tests

### Option A: With Firebase Emulator (recommended)

Creates and uses a local Auth + Firestore emulator so Firestore writes complete quickly and navigation tests pass reliably.

```bash
pnpm test:e2e:emulator
```

This will:

1. Start the Auth and Firestore emulators.
2. Seed the Auth emulator with the user from `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` in `.env.local`.
3. Start the dev server with `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` and run Playwright.

Requirements: Firebase CLI logged in (`pnpm exec firebase login`), a Firebase project (`firebase use <project-id>`), and **Java** on your PATH (required by the Firestore emulator).

### Option B: Against real Firebase

```bash
pnpm test:e2e
```

Starts the dev server and runs tests against your real Firebase project. Create-account tests can be slow or time out if the network is slow or Firestore is unavailable.

- `pnpm test:e2e:ui` – open Playwright UI for debugging.
- `pnpm test:e2e:headed` – run with browser visible.

## Test user (authenticated tests)

Set in `.env.local` (do not commit real credentials):

- `E2E_TEST_USER_EMAIL` – email for the test user
- `E2E_TEST_USER_PASSWORD` – password

For **emulator** runs, this user is created automatically in the Auth emulator. For **real Firebase**, the user must already exist (create it in Firebase Console or by signing up once in the app).

If these are not set, the sign-in and create-account / add-transaction tests that require sign-in will be skipped.

## What is covered

- **auth.spec.ts** – Auth screen visibility, sign in with valid credentials (navigates to dashboard), invalid credentials show error.
- **create-account.spec.ts** – Navigate to Create Account, fill form, submit, assert we are back on dashboard and the new account name appears.
- **add-transaction.spec.ts** – Create an account, open account detail, open Add Transaction modal, fill and submit, assert modal closes and the new transaction description appears.

## Debugging failures

- Run with UI: `pnpm test:e2e:ui` and step through tests.
- Run headed: `pnpm test:e2e:headed` to watch the browser.
- After a failure, check `playwright-report/index.html` and `test-results/` for traces and screenshots.
