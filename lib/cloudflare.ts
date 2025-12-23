// Helper to get Cloudflare environment bindings
export function getCloudflareEnv(): any {
  // In development, always use local JSON DB
  if (process.env.NODE_ENV === "development") {
    return null
  }

  try {
    // OpenNext provides env bindings through cloudflare:workers
    // @ts-ignore
    const { env } = require("cloudflare:workers")
    return env || null
  } catch {
    // Not running on Cloudflare Pages, return null (use local JSON DB)
    return null
  }
}
