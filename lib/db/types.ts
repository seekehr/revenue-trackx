export interface RevenueEntry {
  id: string
  username: string
  amount: number
  timestamp: string
}

export interface User {
  username: string
  password: string
  salt: string
}

export interface Database {
  // Revenue operations (multiple entries per user)
  getRevenues(username: string): Promise<RevenueEntry[]>
  createRevenue(username: string, amount: number, timestamp: string): Promise<RevenueEntry>

  // User operations
  getUser(username: string): Promise<User | null>
  createUser(username: string, password: string, salt: string): Promise<User>
  userExists(username: string): Promise<boolean>
}

// Utility function to generate revenue entry ID from username, password hash, and timestamp
export async function generateRevenueId(username: string, hashedPassword: string, timestamp: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(username + hashedPassword + timestamp)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
