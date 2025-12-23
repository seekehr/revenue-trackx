import type { Database, RevenueEntry, User } from "./types"
import { generateRevenueId } from "./types"

// Use the global D1Database type from @cloudflare/workers-types if available, 
// otherwise use 'any' to avoid recursive type reference with the class name.
export class D1Database implements Database {
  constructor(private db: any) { }

  async getRevenues(username: string): Promise<RevenueEntry[]> {
    const result = await this.db
      .prepare("SELECT * FROM revenue WHERE username = ? ORDER BY timestamp DESC")
      .bind(username)
      .all()
    return (result.results as RevenueEntry[]) || []
  }

  async createRevenue(username: string, amount: number, timestamp: string): Promise<RevenueEntry> {
    const user = await this.getUser(username)
    if (!user) {
      throw new Error("User not found")
    }

    const id = await generateRevenueId(username, user.password, timestamp)
    await this.db
      .prepare("INSERT INTO revenue (id, username, amount, timestamp) VALUES (?, ?, ?, ?)")
      .bind(id, username, amount, timestamp)
      .run()

    return { id, username, amount, timestamp }
  }

  async getUser(username: string): Promise<User | null> {
    const result = await this.db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first()
    return result as User | null
  }

  async createUser(username: string, password: string, salt: string): Promise<User> {
    await this.db
      .prepare("INSERT INTO users (username, password, salt) VALUES (?, ?, ?)")
      .bind(username, password, salt)
      .run()

    return { username, password, salt }
  }

  async userExists(username: string): Promise<boolean> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM users WHERE username = ?")
      .bind(username)
      .first()
    return (result as any).count > 0
  }
}
