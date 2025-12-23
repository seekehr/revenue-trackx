import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase, generateUserHash } from "@/lib/db"

// Helper to get Cloudflare env (when deployed to Cloudflare Pages)
function getCloudflareEnv(): any {
  // @ts-ignore - Cloudflare Pages context
  return typeof process !== "undefined" && process.env?.DB ? process.env : null
}

async function getUserHash(): Promise<string | null> {
  const cookieStore = await cookies()
  const username = cookieStore.get("username")?.value
  const passwordHash = cookieStore.get("passwordHash")?.value

  if (!username || !passwordHash) {
    return null
  }

  // Generate user hash from username and password hash
  return await generateUserHash(username, passwordHash)
}

export async function GET() {
  try {
    const userHash = await getUserHash()
    if (!userHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDatabase(getCloudflareEnv())
    const revenue = await db.getRevenue(userHash)

    // Return empty array if no revenue entry exists yet
    return NextResponse.json(revenue ? [revenue] : [])
  } catch (error) {
    console.error("GET error:", error)
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHash = await getUserHash()
    if (!userHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = getDatabase(getCloudflareEnv())
    const timestamp = new Date().toISOString()
    const entry = await db.upsertRevenue(userHash, Number.parseFloat(amount), timestamp)

    return NextResponse.json(entry)
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Failed to save revenue" }, { status: 500 })
  }
}
