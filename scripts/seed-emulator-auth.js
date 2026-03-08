/**
 * Creates the E2E test user in the Firebase Auth Emulator.
 * Run inside firebase emulators:exec so the emulator is already up.
 * Requires E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD in env (e.g. from .env.local).
 */
const https = require("https")
const http = require("http")

require("dotenv").config({ path: ".env.local" })

const email = process.env.E2E_TEST_USER_EMAIL
const password = process.env.E2E_TEST_USER_PASSWORD
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"

if (!email || !password) {
  console.warn("seed-emulator-auth: E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD not set; skipping seed.")
  process.exit(0)
}

const url = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`
const body = JSON.stringify({
  email,
  password,
  returnSecureToken: true,
})

const isHttps = url.startsWith("https")
const lib = isHttps ? https : http
const req = lib.request(
  url,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
  },
  (res) => {
    let data = ""
    res.on("data", (chunk) => (data += chunk))
    res.on("end", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("seed-emulator-auth: Test user created in Auth emulator.")
        process.exit(0)
        return
      }
      const parsed = JSON.parse(data || "{}")
      if (parsed.error?.message?.includes("EMAIL_EXISTS")) {
        console.log("seed-emulator-auth: Test user already exists.")
        process.exit(0)
        return
      }
      console.error("seed-emulator-auth: Failed to create user:", parsed.error?.message || data)
      process.exit(1)
    })
  }
)
req.on("error", (err) => {
  console.error("seed-emulator-auth: Request error:", err.message)
  process.exit(1)
})
req.write(body)
req.end()
