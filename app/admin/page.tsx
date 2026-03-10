"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ""

interface AdminStats {
  totalUsers: number
  activeUsers24h: number
  activeUsers7d: number
  totalTransactions: number
}

interface RecentUser {
  email: string
  lastActive: Timestamp | null
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace("/")
      return
    }

    const fetchStats = async () => {
      if (!db) {
        setError("Firebase is not configured")
        return
      }
      try {
        const now = Timestamp.now()
        const twentyFourHoursAgo = Timestamp.fromMillis(
          now.toMillis() - 24 * 60 * 60 * 1000
        )
        const sevenDaysAgo = Timestamp.fromMillis(
          now.toMillis() - 7 * 24 * 60 * 60 * 1000
        )

        const usersRef = collection(db, "users")

        const [totalUsersSnap, active24hSnap, active7dSnap, transactionsSnap] =
          await Promise.all([
            getCountFromServer(usersRef),
            getCountFromServer(
              query(usersRef, where("lastActive", ">", twentyFourHoursAgo))
            ),
            getCountFromServer(
              query(usersRef, where("lastActive", ">", sevenDaysAgo))
            ),
            getCountFromServer(collectionGroup(db, "transactions")),
          ])

        setStats({
          totalUsers: totalUsersSnap.data().count,
          activeUsers24h: active24hSnap.data().count,
          activeUsers7d: active7dSnap.data().count,
          totalTransactions: transactionsSnap.data().count,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch stats")
      }
    }

    const fetchRecentUsers = async () => {
      if (!db) return
      try {
        const usersRef = collection(db, "users")
        const q = query(
          usersRef,
          orderBy("lastActive", "desc"),
          limit(5)
        )
        const snapshot = await getDocs(q)
        const list: RecentUser[] = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            email: (data.email as string) ?? "",
            lastActive: (data.lastActive as Timestamp) ?? null,
          }
        })
        setRecentUsers(list)
      } catch (e) {
        // Non-fatal; stats may have failed
      }
    }

    fetchStats()
    fetchRecentUsers()
  }, [user, loading, router])

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-foreground">
            Admin Dashboard
          </h1>
          <Link
            href="/"
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Users
              </p>
              <p className="mt-2 font-serif text-2xl text-foreground">
                {stats.totalUsers}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Users (24h)
              </p>
              <p className="mt-2 font-serif text-2xl text-foreground">
                {stats.activeUsers24h}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Users (7d)
              </p>
              <p className="mt-2 font-serif text-2xl text-foreground">
                {stats.activeUsers7d}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Transactions
              </p>
              <p className="mt-2 font-serif text-2xl text-foreground">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        )}

        {recentUsers.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow">
            <h2 className="mb-4 font-serif text-lg text-foreground">
              Recent Users
            </h2>
            <ul className="divide-y divide-dashed divide-border/60">
              {recentUsers.map((u, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-foreground">{u.email || "—"}</span>
                  <span className="text-muted-foreground">
                    {u.lastActive
                      ? new Date(u.lastActive.toMillis()).toLocaleString()
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
