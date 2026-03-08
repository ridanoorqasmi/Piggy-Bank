/**
 * Run Playwright e2e tests with USE_FIREBASE_EMULATOR=true so the app connects to the emulator.
 * Invoked by: firebase emulators:exec --only auth,firestore -- "node scripts/seed-emulator-auth.js && node scripts/run-e2e-with-emulator.js"
 */
process.env.USE_FIREBASE_EMULATOR = "true"
const { spawn } = require("child_process")
const child = spawn("pnpm", ["exec", "playwright", "test"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
})
child.on("exit", (code) => process.exit(code ?? 0))
