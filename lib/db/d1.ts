import type { Database, RevenueEntry, User } from "./types"

export class D1Database implements Database {
  constructor(private db: D1Database) {}

  async getRevenue(userHash: string): Promise<RevenueEntry | null> {
    const result = await this.db.prepare("SELECT * FROM revenue WHERE id = ?").bind(userHash).first()
    return (result as RevenueEntry) || null
  }

  async upsertRevenue(userHash: string, amount: number, timestamp: string): Promise<RevenueEntry> {
    // D1 supports INSERT OR REPLACE
    await this.db
      .prepare("INSERT OR REPLACE INTO revenue (id, amount, timestamp) VALUES (?, ?, ?)")
      .bind(userHash, amount, timestamp)
      .run()

    return { id: userHash, amount, timestamp }
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
