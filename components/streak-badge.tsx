"use client"

import { Flame } from "lucide-react"

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-piggy-warning/30 bg-piggy-warning/15 px-3.5 py-1.5 shadow-[0_0_12px_-2px_var(--color-piggy-warning,#E0B44A)/20]">
      <Flame className="size-3.5 text-piggy-warning drop-shadow-[0_0_4px_#E0B44A]" />
      <span className="text-xs font-bold tracking-wide text-piggy-warning">
        {streak} day streak
      </span>
    </div>
  )
}
