import { cookies } from "next/headers"
import { getDatabase } from "@/lib/db"
import { getCloudflareEnv } from "@/lib/cloudflare"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body
    console.log("[Revenue Trackx] Login attempt for:", username)

    // Validation
    if (!username || !password) {
      console.warn("[Revenue Trackx] Missing username or password")
      return Response.json({ error: "Username and password are required" }, { status: 400 })
    }

    const env = getCloudflareEnv()
    console.log("[Revenue Trackx] Environment retrieved. DB present:", !!env?.DB)

    const db = getDatabase(env)
    console.log("[Revenue Trackx] Database instance obtained")

    // Check user exists and password matches
    const user = await db.getUser(username)
    console.log("[Revenue Trackx] User lookup complete. Found:", !!user)

    if (!user) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const hashedPassword = await hashPassword(password)
    if (user.password !== hashedPassword) {
      console.warn("[Revenue Trackx] Password mismatch for:", username)
      return Response.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Set session cookies (store username and password hash)
    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always secure on Cloudflare
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }

    cookieStore.set("username", username, cookieOptions)
    cookieStore.set("passwordHash", hashedPassword, cookieOptions)

    console.log("[Revenue Trackx] Login successful for:", username)
    return Response.json({ success: true })
  } catch (error: any) {
    console.error("[Revenue Trackx] Login error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return Response.json({ error: "An error occurred during login: " + error.message }, { status: 500 })
  }
}
