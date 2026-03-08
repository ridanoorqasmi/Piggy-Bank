"use client"

import { LayoutDashboard, BarChart3, User } from "lucide-react"
import type { Screen } from "@/lib/types"

interface BottomNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

const navItems: { icon: typeof LayoutDashboard; label: string; screen: Screen }[] = [
  { icon: LayoutDashboard, label: "Dashboard", screen: "dashboard" },
  { icon: BarChart3, label: "Insights", screen: "insights" },
  { icon: User, label: "Profile", screen: "profile" },
]

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {navItems.map(({ icon: Icon, label, screen }) => {
          const isActive = activeScreen === screen
          return (
            <button
              key={screen}
              type="button"
              onClick={() => onNavigate(screen)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`size-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
              {isActive && (
                <div className="h-0.5 w-4 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
