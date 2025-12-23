"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

interface RevenueEntry {
  id: string
  amount: number
  timestamp: string
  date: Date
}

interface RevenueChartProps {
  entries: RevenueEntry[]
}

type TimeFilter = "1w" | "1m" | "3m" | "1y" | "5y" | "all"

export function RevenueChart({ entries }: RevenueChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1y")
  const [zoomLevel, setZoomLevel] = useState(1)

  const filteredData = useMemo(() => {
    if (entries.length === 0) return []

    const now = new Date()
    let startDate = new Date()

    switch (timeFilter) {
      case "1w":
        startDate.setDate(now.getDate() - 7)
        break
      case "1m":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "5y":
        startDate.setFullYear(now.getFullYear() - 5)
        break
      case "all":
        startDate = new Date(0)
        break
    }

    return entries
      .filter((e) => e.date >= startDate)
      .map((e) => ({
        date: e.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        }),
        amount: e.amount,
        fullDate: e.date.toISOString(),
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  }, [entries, timeFilter])

  const displayData = useMemo(() => {
    if (filteredData.length === 0) return []
    const step = Math.max(1, Math.floor(filteredData.length / Math.min(30, filteredData.length / zoomLevel)))
    return filteredData.filter((_, i) => i % step === 0 || i === filteredData.length - 1)
  }, [filteredData, zoomLevel])

  const maxAmount = Math.max(...filteredData.map((d) => d.amount), 0)
  const yAxisDomain = [0, Math.ceil(maxAmount * 1.1)]

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <p className="mb-2">No data available</p>
        <p className="text-sm">Start by adding your first revenue entry</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["1w", "1m", "3m", "1y", "5y", "all"] as TimeFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={timeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter(filter)}
            className={timeFilter === filter ? "bg-primary text-primary-foreground" : ""}
          >
            {filter === "1w" && "1 Week"}
            {filter === "1m" && "1 Month"}
            {filter === "3m" && "3 Months"}
            {filter === "1y" && "1 Year"}
            {filter === "5y" && "5 Years"}
            {filter === "all" && "All Time"}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div
        onWheel={(e) => {
          e.preventDefault()
          const newZoom = Math.max(1, Math.min(5, zoomLevel + (e.deltaY > 0 ? -0.5 : 0.5)))
          setZoomLevel(newZoom)
        }}
        className="h-96 w-full cursor-zoom-in"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "var(--color-muted-foreground)" }}
              domain={yAxisDomain}
              label={{ value: "Revenue (USD)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={(label) => `Date: ${label}`}
              cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#22c55e"
              dot={{ fill: "#22c55e", r: 4 }}
              activeDot={{ r: 6, fill: "#a855f7" }}
              strokeWidth={2}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center">Scroll to zoom in/out</p>
    </div>
  )
}
