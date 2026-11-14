// Runs a database task against the LIVE database (the address in .env.live.local), after safety checks
// and a typed confirmation.
//
//   npm run live:db:push   Adds new columns/tables the code needs. Prisma asks first if anything would be deleted.
//   npm run live:db:seed   Loads the starter catalogue from prisma/seed.ts: adds new products and RESETS the
//                          starter products' names, descriptions, prices and bundled photos to the seed values.
//                          Products you added yourself in the admin area are not touched.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const TASKS = {
  push: { label: "add the new database columns (prisma db push)", cmd: ["npx", "prisma", "db", "push", "--skip-generate"] },
  seed: { label: "load the starter catalogue (prisma/seed.ts) — resets starter products' prices, names and photos", cmd: ["npx", "tsx", "prisma/seed.ts"] },
};

const task = TASKS[process.argv[2]];
if (!task) {
  console.error(`Usage: node scripts/with-live-db.mjs <${Object.keys(TASKS).join("|")}>`);
  process.exit(1);
}

function databaseUrl(file) {
  if (!existsSync(file)) return "";
  return (readFileSync(file, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]*)"?/m)?.[1] ?? "").trim();
}

const live = databaseUrl(".env.live.local");
if (!/^(postgres|postgresql|prisma\+postgres):\/\//.test(live)) {
  console.error("✗ .env.live.local needs the live database's DATABASE_URL (see npm run admin:create:live).");
  process.exit(1);
}
if (live === databaseUrl(".env")) {
  console.error("✗ The address in .env.live.local is your LOCAL TEST database (same as .env), not the live one.");
  process.exit(1);
}

// Overrides any DATABASE_URL already in the terminal (e.g. loaded from .env by VS Code).
const env = { ...process.env, DATABASE_URL: live };

const probe = spawnSync(
  process.execPath,
  ["-e", `const {PrismaClient}=require("@prisma/client");const db=new PrismaClient();Promise.all([db.product.count(),db.order.count()]).then(([p,o])=>{console.log(p+" products, "+o+" orders");return db.$disconnect();}).catch(e=>{console.error(String(e.message).split("\\n").filter(Boolean).pop());process.exit(1);});`],
  { env, encoding: "utf8" },
);
if (probe.status !== 0) {
  console.error(`✗ Couldn't connect to the live database: ${probe.stderr.trim() || "unknown error"}`);
  process.exit(1);
}

console.log(`\nLIVE database: ${probe.stdout.trim()}`);
console.log(`About to ${task.label}.\n`);
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (await rl.question('This changes your LIVE store. Type "yes" to continue: ')).trim().toLowerCase();
rl.close();
if (answer !== "yes") {
  console.log("Cancelled. Nothing was changed.");
  process.exit(0);
}

const run = spawnSync(task.cmd[0], task.cmd.slice(1), { env, stdio: "inherit", shell: true });
process.exit(run.status ?? 1);
