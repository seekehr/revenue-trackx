export interface RevenueEntry {
  id: string
  amount: number
  timestamp: string
}

export interface User {
  username: string
  password: string
  salt: string
}

export interface Database {
  // Revenue operations (one entry per user)
  getRevenue(userHash: string): Promise<RevenueEntry | null>
  upsertRevenue(userHash: string, amount: number, timestamp: string): Promise<RevenueEntry>

  // User operations
  getUser(username: string): Promise<User | null>
  createUser(username: string, password: string, salt: string): Promise<User>
  userExists(username: string): Promise<boolean>
}

// Utility function to generate user hash from username and password (this is the revenue entry ID)
export async function generateUserHash(username: string, hashedPassword: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(username + hashedPassword)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
