// Helper to get Cloudflare environment bindings
export function getCloudflareEnv(): any {
  // In development, always use local JSON DB
  if (process.env.NODE_ENV === "development") {
    return null
  }

  try {
    // Try to import @cloudflare/next-on-pages for Cloudflare Pages deployment
    // @ts-ignore
    const { getRequestContext } = require("@cloudflare/next-on-pages")
    const context = getRequestContext()
    return context?.env || null
  } catch {
    // Not running on Cloudflare Pages, return null (use local JSON DB)
    return null
  }
}
