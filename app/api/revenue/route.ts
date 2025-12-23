import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/db"
import { getCloudflareEnv } from "@/lib/cloudflare"

async function getUsername(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("username")?.value || null
}

export async function GET() {
  try {
    const username = await getUsername()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDatabase(getCloudflareEnv())
    const revenues = await db.getRevenues(username)

    return NextResponse.json(revenues)
  } catch (error) {
    console.error("GET error:", error)
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getUsername()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = getDatabase(getCloudflareEnv())
    const timestamp = new Date().toISOString()
    const entry = await db.createRevenue(username, Number.parseFloat(amount), timestamp)

    return NextResponse.json(entry)
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Failed to save revenue" }, { status: 500 })
  }
}
