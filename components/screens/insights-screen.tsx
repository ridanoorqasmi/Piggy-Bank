"use client"

import Image from "next/image"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type { Transaction } from "@/lib/types"
import { categoryColors, weeklySpending } from "@/lib/data"
import { StreakBadge } from "@/components/streak-badge"

interface InsightsScreenProps {
  transactions: Transaction[]
}

export function InsightsScreen({ transactions }: InsightsScreenProps) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense")

  const categoryData = expenseTransactions.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    },
    {}
  )

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] ?? "#8E92A4",
  }))

  const totalSpent = expenseTransactions.reduce((s, t) => s + t.amount, 0)

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
        {/* Pie Chart */}
        <div className="retro-card retro-noise animate-retro-in stagger-1 rounded-2xl bg-card p-6">
          <h3 className="font-serif text-base text-foreground">
            Category Breakdown
          </h3>
          <p className="mb-4 mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total spent: ${totalSpent.toFixed(2)}
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1B1D27",
                    border: "1px solid #2C2F3A",
                    borderRadius: "12px",
                    color: "#EDEEF2",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="retro-divider mt-4 border-t" />
          <div className="mt-4 flex flex-wrap gap-3">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="retro-card retro-noise animate-retro-in stagger-2 rounded-2xl bg-card p-6">
          <h3 className="mb-4 font-serif text-base text-foreground">
            Weekly Spending
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySpending}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#8E92A4" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1B1D27",
                    border: "1px solid #2C2F3A",
                    borderRadius: "12px",
                    color: "#EDEEF2",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value}`, "Spent"]}
                  cursor={{ fill: "rgba(242,130,106,0.06)" }}
                />
                <Bar
                  dataKey="amount"
                  fill="#F2826A"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streak Card */}
        <div className="retro-card retro-noise animate-retro-in stagger-3 rounded-2xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-foreground">Your Streak</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep logging to build your streak
              </p>
            </div>
            <StreakBadge streak={7} />
          </div>
        </div>

        {/* Motivational Card with mascot */}
        <div className="animate-retro-in stagger-4 flex flex-col items-center gap-3 rounded-2xl border border-piggy-success/20 bg-piggy-success/8 p-6">
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
