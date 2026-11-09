// First-time setup: creates .env (with a random AUTH_SECRET), the database and sample products.
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

run("npx prisma generate");
run("npx prisma db push");
run("npx tsx --env-file=.env prisma/seed.ts");

console.log("\n✓ Setup complete.");
console.log("  Next: create your admin account →  npm run admin:create");
console.log("  Then start the site            →  npm run dev");
