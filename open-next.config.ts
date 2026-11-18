import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every store page is rendered on demand, so no extra cache storage is needed.
export default defineCloudflareConfig({});
