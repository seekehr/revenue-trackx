import { cookies } from "next/headers"
import { getDatabase } from "@/lib/db"
import { getCloudflareEnv } from "@/lib/cloudflare"

// Simple password hashing (use bcryptjs for production)
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

    if (username.length < 3) {
      return Response.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const db = getDatabase(getCloudflareEnv())

    // Check if user already exists
    if (await db.userExists(username)) {
      return Response.json({ error: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Store user
    await db.createUser(username, hashedPassword, "")

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
    console.error("[Revenue Trackx] Signup error:", error)
    return Response.json({ error: "An error occurred during signup" }, { status: 500 })
  }
}
