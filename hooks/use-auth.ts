"use client"

import { useState, useEffect } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    setPersistence(auth, browserLocalPersistence).catch(() => {})
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    setError(null)
    if (!auth) {
      setError("Firebase is not configured")
      return
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      const err = e as { code?: string; message?: string }
      const isInvalidCreds =
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password" ||
        err?.message?.toLowerCase().includes("invalid")
      const message = isInvalidCreds
        ? "Invalid email or password. Please try again."
        : err?.message ?? (e instanceof Error ? e.message : "Sign in failed")
      setError(message)
      throw e
    }
  }

  async function signUp(email: string, password: string, displayName?: string) {
    setError(null)
    if (!auth) {
      setError("Firebase is not configured")
      return
    }
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName?.trim()) {
        await updateProfile(newUser, { displayName: displayName.trim() })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign up failed"
      setError(message)
      throw e
    }
  }

  async function signOut() {
    setError(null)
    if (!auth) return
    await firebaseSignOut(auth)
  }

  return { user, loading, error, setError, signIn, signUp, signOut }
}
