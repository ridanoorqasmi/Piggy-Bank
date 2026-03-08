# Deploying Piggy Bank

## Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** > **Sign-in method** > **Email/Password**.
3. Create a **Firestore** database (start in test mode if needed; then deploy rules).
4. In Project settings, copy your web app config and add to `.env.local` (see `.env.example`).

## Deploy Firestore rules

From the project root:

```bash
firebase deploy --only firestore:rules
```

(Requires `firebase-tools` and `firebase login`; link the project with `firebase use`.)

## Vercel (or other host)

1. Set environment variables from `.env.example` as production env vars (e.g. in Vercel dashboard).
2. Deploy: `pnpm build` then deploy the `.next` output, or connect the repo to Vercel for automatic deploys.

## E2E tests

Run with `pnpm test:e2e`. See [e2e/README.md](e2e/README.md) for how to set `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD` so authenticated flows (create account, add transaction) run instead of being skipped.

## PWA / mobile

- The app is installable as a PWA (manifest + service worker).
- Open the deployed URL on your phone and use “Add to Home Screen” (or the install prompt) for an app-like experience.
