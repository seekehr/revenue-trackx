import type { Database, RevenueEntry, User } from "./types"
import { promises as fs } from "fs"
import path from "path"

interface JsonData {
  revenues: Record<string, RevenueEntry>
  users: User[]
}

export class JsonDatabase implements Database {
  private dataPath: string
  private data: JsonData | null = null

  constructor(dataPath = path.join(process.cwd(), ".database", "data.json")) {
    this.dataPath = dataPath
  }

  private async ensureDataDir(): Promise<void> {
    const dir = path.dirname(this.dataPath)
    try {
      await fs.access(dir)
    } catch {
      await fs.mkdir(dir, { recursive: true })
    }
  }

  private async loadData(): Promise<JsonData> {
    if (this.data) return this.data

    await this.ensureDataDir()

    try {
      const content = await fs.readFile(this.dataPath, "utf-8")
      this.data = JSON.parse(content)
      return this.data!
    } catch {
      this.data = { revenues: {}, users: [] }
      await this.saveData()
      return this.data
    }
  }

  private async saveData(): Promise<void> {
    if (!this.data) return
    await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), "utf-8")
  }

  async getRevenue(userHash: string): Promise<RevenueEntry | null> {
    const data = await this.loadData()
    return data.revenues[userHash] || null
  }

  async upsertRevenue(userHash: string, amount: number, timestamp: string): Promise<RevenueEntry> {
    const data = await this.loadData()
    const newEntry: RevenueEntry = {
      id: userHash,
      amount,
      timestamp,
    }
    data.revenues[userHash] = newEntry
    await this.saveData()
    return newEntry
  }

  async getUser(username: string): Promise<User | null> {
    const data = await this.loadData()
    return data.users.find((u) => u.username === username) || null
  }

  async createUser(username: string, password: string, salt: string): Promise<User> {
    const data = await this.loadData()
    const newUser: User = { username, password, salt }
    data.users.push(newUser)
    await this.saveData()
    return newUser
  }

  async userExists(username: string): Promise<boolean> {
    const data = await this.loadData()
    return data.users.some((u) => u.username === username)
  }
}
