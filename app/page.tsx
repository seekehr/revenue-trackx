"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RevenueChart } from "@/components/revenue-chart"
import { Footer } from "@/components/footer"

interface RevenueEntry {
  id: string
  amount: number
  timestamp: string
  date: Date
}

export default function Page() {
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load entries from API on mount
  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/revenue")
      if (response.ok) {
        const data = await response.json()
        setEntries(
          data.map((entry: any) => ({
            ...entry,
            date: new Date(entry.timestamp),
          })),
        )
      }
    } catch (error) {
      console.error("Failed to load entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number.parseFloat(amount))) {
      alert("Please enter a valid amount")
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number.parseFloat(amount) }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setEntries([
          ...entries,
          {
            ...newEntry,
            date: new Date(newEntry.timestamp),
          },
        ])
        setAmount("")
      }
    } catch (error) {
      console.error("Failed to save revenue:", error)
      alert("Failed to save revenue")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 p-4 md:p-8">
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">Track and visualize your revenue over time</p>
          </div>

          <div className="flex gap-3 items-end">
            <form onSubmit={handleAddRevenue} className="flex gap-2 items-end">
              <div>
                <label className="text-sm font-medium block mb-1.5">Add Revenue</label>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={isSaving}
                    className="w-32 h-9 text-sm [&::-webkit-outer-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:[appearance:none] [&[type=number]]:{-moz-appearance:textfield}"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-purple-600 text-primary-foreground h-9 px-4 text-sm transition-colors"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Add"}
              </Button>
            </form>

            {entries.length > 0 && (
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-accent">
                    ${entries.reduce((sum, e) => sum + e.amount, 0).toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Count</p>
                  <p className="text-lg font-bold">{entries.length}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                ) : (
                  <RevenueChart entries={entries} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
