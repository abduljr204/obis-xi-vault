import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Database address. On Cloudflare it goes through Hyperdrive (the HYPERDRIVE binding in wrangler.jsonc),
 * which keeps connections warm close to the store. Everywhere else (your computer, Vercel) it's DATABASE_URL.
 */
function connectionString() {
  try {
    // Only available inside a request on Cloudflare; throws anywhere else.
    const hyperdrive = (getCloudflareContext().env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    if (hyperdrive?.connectionString) return hyperdrive.connectionString;
  } catch {
    // not on Cloudflare
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

// Cloudflare Workers can't reuse a database connection across requests, so each connection is used once
// (maxUses: 1). Through Hyperdrive that's cheap; the client itself is created on first use and then shared.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function client() {
  return (globalForPrisma.prisma ??= new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString(), maxUses: 1 }) }));
}

/** The database client. Created lazily so it's set up inside the first request (where Cloudflare's bindings exist). */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
