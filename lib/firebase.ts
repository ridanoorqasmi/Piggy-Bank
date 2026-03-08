import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const useEmulator = typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"

function getFirebase() {
  if (typeof window === "undefined" || !firebaseConfig.apiKey) {
    return { app: null, auth: null, db: null }
  }
  const app = getApps().length
    ? (getApps()[0] as FirebaseApp)
    : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  if (useEmulator) {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
      connectFirestoreEmulator(db, "127.0.0.1", 8080)
    } catch {
      // already connected
    }
  }
  return { app, auth, db }
}

const { app, auth, db } = getFirebase()

export { app, auth, db }
