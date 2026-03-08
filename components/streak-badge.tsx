"use client"

import { Flame } from "lucide-react"

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-piggy-warning/20 bg-piggy-warning/10 px-3 py-1">
      <Flame className="size-3.5 text-piggy-warning" />
      <span className="text-xs font-bold text-piggy-warning">
        {streak} day streak
      </span>
    </div>
  )
}
