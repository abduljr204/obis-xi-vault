// Create (or reset the password of) an admin login on the LIVE database — the one Vercel uses.
//
//   1. Put the live database's DATABASE_URL in .env.live.local (git ignores this file):
//        DATABASE_URL="postgres://..."
//      Find it in Vercel → Storage → the database connected to Production → .env.local tab → Show secret.
//   2. npm run admin:create:live              (asks for email + password)
//      npm run admin:create:live -- --check   (only shows jerseys/admin count, changes nothing)
//
// Works in any terminal, and refuses to run if the address is your local test database (.env).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const LIVE_FILE = ".env.live.local";

function databaseUrl(file) {
  if (!existsSync(file)) return "";
  return (readFileSync(file, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]*)"?/m)?.[1] ?? "").trim();
}

const live = databaseUrl(LIVE_FILE);
const local = databaseUrl(".env");

if (!/^(postgres|postgresql|prisma\+postgres):\/\//.test(live)) {
  console.error(`✗ ${LIVE_FILE} needs the live database's address on a line like:
    DATABASE_URL="postgres://..."
  Find it in Vercel → Storage → the database connected to Production → .env.local tab → Show secret.`);
  process.exit(1);
}
if (live === local) {
  console.error(`✗ That address is your LOCAL TEST database (the same as in .env), not the live one.
  In Vercel → Storage, open the database whose "Connected Projects" shows Production, and copy its DATABASE_URL.`);
  process.exit(1);
}

// Overrides any DATABASE_URL already in the terminal (e.g. loaded from .env by VS Code).
const env = { ...process.env, DATABASE_URL: live };

// Show which database this is before changing anything.
const probe = spawnSync(
  process.execPath,
  [
    "-e",
    `const {PrismaClient}=require("@prisma/client");const db=new PrismaClient();
     Promise.all([db.product.count(),db.admin.count()])
       .then(([p,a])=>{console.log(p+" jerseys, "+a+" admin login(s)");return db.$disconnect();})
       .catch(e=>{console.error(String(e.message).split("\\n").filter(Boolean).pop());process.exit(1);});`,
  ],
  { env, encoding: "utf8" },
);
if (probe.status !== 0) {
  console.error(`✗ Couldn't connect to the live database: ${probe.stderr.trim() || "unknown error"}`);
  process.exit(1);
}
console.log(`Live database: ${probe.stdout.trim()}\n`);
if (process.argv.includes("--check")) process.exit(0); // look only, change nothing

const run = spawnSync("npx", ["tsx", "scripts/create-admin.ts", ...process.argv.slice(2)], { env, stdio: "inherit", shell: true });
process.exit(run.status ?? 1);
