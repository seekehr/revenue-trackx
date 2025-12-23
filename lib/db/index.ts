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
  if (process.env.NODE_ENV === "production" || process.env.NEXTJS_ENV === "production") {
    throw new Error("Missing database binding (DB). Ensure your Cloudflare Pages D1 binding is configured with name 'DB'.")
  }

  if (!dbInstance) {
    dbInstance = new JsonDatabase()
  }
  return dbInstance
}

export type { Database, RevenueEntry, User } from "./types"
export { generateRevenueId } from "./types"
