import type { Database } from "./types"
import { D1Database } from "./d1"
import { JsonDatabase } from "./json"

let dbInstance: Database | null = null

export function getDatabase(cloudflareEnv?: any): Database {
  // In production with Cloudflare Pages, use D1
  if (cloudflareEnv?.DB) {
    return new D1Database(cloudflareEnv.DB)
  }

  // In development, use JSON file storage (singleton)
  if (!dbInstance) {
    dbInstance = new JsonDatabase()
  }
  return dbInstance
}

export type { Database, RevenueEntry, User } from "./types"
export { generateUserHash } from "./types"
