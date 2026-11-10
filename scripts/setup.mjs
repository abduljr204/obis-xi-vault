// First-time setup: creates .env (with a random AUTH_SECRET), the database tables and sample products.
// Run with:  npm run setup
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (!existsSync(".env")) {
  const secret = randomBytes(48).toString("base64url");
  writeFileSync(".env", readFileSync(".env.example", "utf8").replace("change-me-to-a-long-random-string", secret));
  console.log("✓ Created .env with a fresh AUTH_SECRET");
} else {
  console.log("• .env already exists — leaving it as is");
}

// The store needs a Postgres database. Stop with clear instructions until .env points at one.
const databaseUrl = readFileSync(".env", "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]*)"?/m)?.[1] ?? "";
if (!/^(postgres|postgresql|prisma\+postgres):\/\//.test(databaseUrl) || databaseUrl.includes("USER:PASSWORD@HOST")) {
  console.error(`
✗ DATABASE_URL in .env is not a Postgres database yet.

  1. Create a free Postgres database (for example at https://neon.tech or https://console.prisma.io).
     Use a separate one for your computer, not the database of the live site.
  2. Open .env and replace the DATABASE_URL line with its connection string, e.g.
       DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
  3. Run this again (npm run setup, or double-click Start Store.bat).
`);
  process.exit(1);
}

run("npx prisma generate");
run("npx prisma db push");
run("npx tsx --env-file=.env prisma/seed.ts");

// Start Store.bat checks for this file so setup (and the seed, which resets product prices) only runs once.
writeFileSync(".setup-done", `Setup completed ${new Date().toISOString()}\n`);

console.log("\n✓ Setup complete.");
console.log("  Next: create your admin account →  npm run admin:create");
console.log("  Then start the site            →  npm run dev");
