"use client"

import { useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

export function ActivityTracker() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !db) return

    const uid = user.uid
    const email = user.email ?? ""

    const syncUser = async () => {
      if (!db) return
      try {
        const userRef = doc(db, "users", uid)
        const snap = await getDoc(userRef)

        if (!snap.exists()) {
          await setDoc(userRef, {
            uid,
            email,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
          })
        } else {
          await updateDoc(userRef, {
            lastActive: serverTimestamp(),
          })
        }
      } catch {
        // Silently ignore tracking errors
      }
    }

    syncUser()
  }, [user?.uid, user?.email])

  return null
}
