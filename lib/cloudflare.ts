```javascript
// Helper to get Cloudflare environment bindings
export function getCloudflareEnv(): any {
  console.log("[Revenue Trackx] getCloudflareEnv called. NODE_ENV:", process.env.NODE_ENV);
  
  // In development, always use local JSON DB
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // Method 1: Try getCloudflareContext (standard for OpenNext)
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env) {
      console.log("[Revenue Trackx] Found env via getCloudflareContext. Keys:", Object.keys(ctx.env));
      return ctx.env;
    }
  } catch (e) {
    // Expected to fail if not running on Cloudflare
  }

  // Method 2: Try cloudflare:workers (modern OpenNext)
  try {
    // @ts-ignore
    const cf = require("cloudflare:workers");
    if (cf?.env) {
      console.log("[Revenue Trackx] Found env via cloudflare:workers. Keys:", Object.keys(cf.env));
      return cf.env;
    }
  } catch (e) {
    // Expected to fail if not running on Cloudflare
  }

  console.warn("[Revenue Trackx] No Cloudflare environment found. Falling back to JSON DB (will fail in production)");
  return null;
}
```
