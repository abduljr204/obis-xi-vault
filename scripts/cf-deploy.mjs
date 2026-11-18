// Builds the store for Cloudflare Workers and publishes it.   npm run cf:deploy
//
// Needs: `npx wrangler login` once on this computer. Secrets (database, Stripe, email, login secret) live in
// Cloudflare (Workers & Pages → obis-xi-vault → Settings → Variables and Secrets), not in this project.
import { spawnSync } from "node:child_process";

/** The store's public address. Change this when the domain is connected (Stripe returns customers here). */
const SITE_URL = "https://obis-xi-vault.benhassnabdulrhman.workers.dev";

const env = {
  ...process.env,
  // Overrides the localhost address in .env: Next.js bakes this into the build.
  NEXT_PUBLIC_SITE_URL: SITE_URL,
  // The deploy step simulates Cloudflare locally and wants a database address for the Hyperdrive binding.
  // It isn't used for anything; the live store uses the real Hyperdrive connection.
  CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE: "postgres://unused:unused@127.0.0.1:5432/unused",
};

for (const step of [
  ["npx", "opennextjs-cloudflare", "build"],
  ["npx", "opennextjs-cloudflare", "deploy"],
]) {
  console.log(`\n▶ ${step.join(" ")}`);
  const run = spawnSync(step[0], step.slice(1), { env, stdio: "inherit", shell: true });
  if (run.status !== 0) process.exit(run.status ?? 1);
}
console.log(`\n✓ Deployed: ${SITE_URL}`);
