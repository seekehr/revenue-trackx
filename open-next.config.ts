const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // Ensure D1 bindings are available
      incrementalCache: "dummy",
    },
  },
}

export default config
