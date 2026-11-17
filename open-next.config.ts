// OpenNext adapter config for the Cloudflare Workers deploy (see wrangler.jsonc).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Prerendered pages are served from the deployed static assets; nothing revalidates at runtime,
// so no KV/R2 binding is needed.
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
