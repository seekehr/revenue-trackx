// Helper to get Cloudflare environment bindings
export function getCloudflareEnv(): any {
  console.log("[Revenue Trackx] getCloudflareEnv called. NODE_ENV:", process.env.NODE_ENV)

  // In development, always use local JSON DB
  if (process.env.NODE_ENV === "development") {
    return null
  }

  try {
    // 1. Try cloudflare:workers (modern OpenNext)
    // @ts-ignore
    const cf = require("cloudflare:workers")
    if (cf?.env) {
      console.log("[Revenue Trackx] Found env via cloudflare:workers. Keys:", Object.keys(cf.env))
      return cf.env
    }
  } catch (e) {
    console.error("[Revenue Trackx] cloudflare:workers not available:", e)
  }

  // 2. Fallback to global env (legacy/other OpenNext configs)
  // @ts-ignore
  if (globalThis.process?.env) {
    console.log("[Revenue Trackx] Checking globalThis.process.env")
  }

  console.warn("[Revenue Trackx] No Cloudflare environment found. Falling back to JSON DB (will fail in production)")
  return null
}
