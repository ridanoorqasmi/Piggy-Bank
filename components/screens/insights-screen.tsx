"use client"

import { useState } from "react"
import Image from "next/image"
import { useCurrency } from "@/contexts/currency-context"
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
} from "recharts"
import type { Transaction } from "@/lib/types"
import {
  getCategoryColor,
  resolveCanonicalCategoryName,
} from "@/constants/categories"

interface InsightsScreenProps {
  transactions: Transaction[]
}

// Custom active shape — lifts the segment outward with a subtle glow
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill, cornerRadius,
  } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number
    startAngle: number; endAngle: number; fill: string; cornerRadius: number
  }
  return (
    <g>
      <defs>
        <filter id="segment-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={cornerRadius ?? 10}
        filter="url(#segment-glow)"
        opacity={1}
      />
    </g>
  )
}

export function InsightsScreen({ transactions }: InsightsScreenProps) {
  const { formatWithSymbol } = useCurrency()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const expenseTransactions = transactions.filter((t) => t.type === "expense")

  const categoryData = expenseTransactions.reduce<Record<string, number>>(
    (acc, t) => {
      const label = resolveCanonicalCategoryName(t.category, "expense")
      acc[label] = (acc[label] ?? 0) + Math.abs(t.amount)
      return acc
    },
    {}
  )

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name, "expense"),
  }))

  const totalSpent = expenseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0)

  const activeEntry = activeIndex !== null ? pieData[activeIndex] : null

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-6 pb-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="flex items-center gap-3 pt-6">
          <div className="animate-wiggle size-10 overflow-hidden rounded-full border-2 border-accent/20">
            <Image
              src="/images/piggy-insights.jpg"
              alt="Piggy professor mascot"
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-foreground">Insights</h1>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {"Your spending patterns this week"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6">
        {/* Donut Chart */}
        <div className="retro-card retro-noise animate-retro-in stagger-1 rounded-2xl bg-card p-6">
          <h3 className="font-serif text-base text-foreground">
            Category Breakdown
          </h3>
          <p className="mb-4 mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total spent: {formatWithSymbol(totalSpent)}
          </p>

          {/* Chart + center label */}
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={5}
                  cornerRadius={10}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center label overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              {activeEntry ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {activeEntry.name}
                  </span>
                  <span className="font-serif text-2xl leading-tight text-foreground">
                    {formatWithSymbol(activeEntry.value)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Total
                  </span>
                  <span className="font-serif text-2xl leading-tight text-foreground">
                    {formatWithSymbol(totalSpent)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="retro-divider mt-4 border-t" />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {pieData.map((entry, index) => (
              <button
                key={entry.name}
                className="flex items-center gap-2 transition-opacity"
                style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.4 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="size-2.5 rounded-full shadow-[0_0_6px_1px_currentColor]"
                  style={{ backgroundColor: entry.color, color: entry.color }}
                />
                <span
                  className="max-w-[min(140px,100%)] truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  title={entry.name}
                >
                  {entry.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Motivational Card with mascot */}
        <div className="animate-retro-in stagger-2 flex flex-col items-center gap-3 rounded-2xl border border-piggy-success/20 bg-piggy-success/8 p-6">
          <div className="animate-float size-16 overflow-hidden rounded-full">
            <Image
              src="/images/piggy-success.jpg"
              alt="Piggy celebrating your savings"
              width={64}
              height={64}
              className="size-full object-cover"
            />
          </div>
          <p className="text-center font-serif text-sm text-piggy-success">
            You saved your piggy today
          </p>
          <p className="text-center text-[10px] font-medium uppercase tracking-wider text-piggy-success/60">
            {"You're on track with your savings goals"}
          </p>
        </div>
      </div>
    </div>
  )
}
