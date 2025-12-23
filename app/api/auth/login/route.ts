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
    const { username, password } = await request.json()

    // Validation
    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 })
    }

    const db = getDatabase(getCloudflareEnv())

    // Check user exists and password matches
    const user = await db.getUser(username)
    if (!user) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const hashedPassword = await hashPassword(password)
    if (user.password !== hashedPassword) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Set session cookies (store username and password hash)
    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }

    cookieStore.set("username", username, cookieOptions)
    cookieStore.set("passwordHash", hashedPassword, cookieOptions)

    return Response.json({ success: true })
  } catch (error) {
    console.error("[Revenue Trackx] Login error:", error)
    return Response.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
