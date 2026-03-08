"use client"

import Image from "next/image"
import { ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StreakBadge } from "@/components/streak-badge"
import type { User } from "firebase/auth"

interface ProfileScreenProps {
  user?: User | null
  onLogout: () => void
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "User"
  const email = user?.email ?? ""
  const initial = displayName.charAt(0).toUpperCase()
  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-6 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="pt-6">
          <h1 className="font-serif text-2xl text-foreground">Profile</h1>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6">
        {/* Avatar Section with mascot */}
        <div className="retro-card retro-noise animate-retro-in stagger-1 flex flex-col items-center gap-3 rounded-2xl bg-card p-8">
          <div className="relative">
            <div className="size-24 overflow-hidden rounded-full border-2 border-primary/20">
              <Image
                src="/images/piggy-profile.jpg"
                alt="Your piggy avatar"
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary font-serif text-xs font-bold text-primary-foreground">
              {initial}
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-serif text-xl text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground">{email || "—"}</p>
          </div>
          <StreakBadge streak={7} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "3", label: "Accounts", className: "text-foreground" },
            { value: "2", label: "Goals", className: "text-piggy-success" },
            { value: "7", label: "Day Streak", className: "text-piggy-warning" },
          ].map((stat, i) => (
            <div key={stat.label} className={`retro-card retro-noise animate-retro-in stagger-${i + 2} rounded-2xl bg-card p-4 text-center`}>
              <p className={`font-serif text-2xl ${stat.className}`}>{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings items */}
        <div className="retro-card retro-noise animate-retro-in stagger-5 rounded-2xl bg-card">
          {[
            "Notifications",
            "Currency",
            "Categories",
            "Export Data",
          ].map((item, i, arr) => (
            <button
              key={item}
              className={`flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 ${
                i < arr.length - 1 ? "border-b border-dashed border-border/60" : ""
              }`}
            >
              {item}
              <ArrowLeft className="size-4 rotate-180 text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={onLogout}
          className="h-12 rounded-xl border-border bg-card text-sm font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
