import type { Database, RevenueEntry, User } from "./types"
import { generateRevenueId } from "./types"
import { promises as fs } from "fs"
import path from "path"

interface JsonData {
  revenues: RevenueEntry[]
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
      const rawData = JSON.parse(content)

      // Migration: convert old format (revenues as object) to new format (revenues as array)
      if (rawData.revenues && !Array.isArray(rawData.revenues)) {
        rawData.revenues = Object.values(rawData.revenues)
      }

      // Ensure revenues is always an array
      if (!rawData.revenues) {
        rawData.revenues = []
      }
      if (!rawData.users) {
        rawData.users = []
      }

      this.data = rawData as JsonData
      // Save migrated data
      await this.saveData()
      return this.data
    } catch {
      this.data = { revenues: [], users: [] }
      await this.saveData()
      return this.data
    }
  }

  private async saveData(): Promise<void> {
    if (!this.data) return
    await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), "utf-8")
  }

  async getRevenues(username: string): Promise<RevenueEntry[]> {
    const data = await this.loadData()
    return data.revenues
      .filter((r) => r.username === username)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  async createRevenue(username: string, amount: number, timestamp: string): Promise<RevenueEntry> {
    const data = await this.loadData()
    const user = data.users.find((u) => u.username === username)
    if (!user) {
      throw new Error("User not found")
    }

    const id = await generateRevenueId(username, user.password, timestamp)
    const newEntry: RevenueEntry = {
      id,
      username,
      amount,
      timestamp,
    }
    data.revenues.push(newEntry)
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
