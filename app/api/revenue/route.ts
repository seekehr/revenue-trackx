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
    console.log("[Revenue Trackx] Revenue GET: username from cookie:", username)

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const env = getCloudflareEnv()
    console.log("[Revenue Trackx] Revenue GET: Env retrieved. DB present:", !!env?.DB)

    const db = getDatabase(env)
    const revenues = await db.getRevenues(username)
    console.log("[Revenue Trackx] Revenue GET: found entries:", revenues.length)

    return NextResponse.json(revenues)
  } catch (error: any) {
    console.error("[Revenue Trackx] Revenue GET error:", {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ error: "Failed to fetch revenue: " + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getUsername()
    console.log("[Revenue Trackx] Revenue POST: username from cookie:", username)

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body
    console.log("[Revenue Trackx] Revenue POST: amount requested:", amount)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const env = getCloudflareEnv()
    console.log("[Revenue Trackx] Revenue POST: Env retrieved. DB present:", !!env?.DB)

    const db = getDatabase(env)
    const timestamp = new Date().toISOString()
    const entry = await db.createRevenue(username, Number.parseFloat(amount), timestamp)
    console.log("[Revenue Trackx] Revenue POST: Entry created:", entry.id)

    return NextResponse.json(entry)
  } catch (error: any) {
    console.error("[Revenue Trackx] Revenue POST error:", {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ error: "Failed to save revenue: " + error.message }, { status: 500 })
  }
}
