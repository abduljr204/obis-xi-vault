// Copies everything from the CURRENT live database (.env.live.local) to the NEW one (.env.newlive.local):
// admin logins, products, photos list, orders, order counter and jersey requests, keeping every ID.
// The current database is only read, never changed.
//
//   node scripts/copy-database.mjs --check     show row counts in both, change nothing
//   node scripts/copy-database.mjs             copy into the new database (must be empty)
//   node scripts/copy-database.mjs --replace   empty the NEW database first, then copy (to refresh it)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const url = (file) =>
  existsSync(file) ? ((readFileSync(file, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]*)"?/m) ?? [])[1] ?? "").trim() : "";

const sourceUrl = url(".env.live.local");
const targetUrl = url(".env.newlive.local");
const testUrl = url(".env");
for (const [name, u] of [[".env.live.local", sourceUrl], [".env.newlive.local", targetUrl]]) {
  if (!/^postgres(ql)?:\/\//.test(u)) {
    console.error(`✗ ${name} needs a DATABASE_URL="postgres://..." line.`);
    process.exit(1);
  }
}
if (sourceUrl === targetUrl) {
  console.error("✗ The current and new database addresses are the same.");
  process.exit(1);
}
if (targetUrl === testUrl || sourceUrl === testUrl) {
  console.error("✗ One of the addresses is your LOCAL TEST database (.env).");
  process.exit(1);
}

const client = (connectionString) => new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const source = client(sourceUrl);
const target = client(targetUrl);

// Parents before children, so links between tables are valid.
const TABLES = ["admin", "product", "productImage", "counter", "jerseyRequest", "order", "orderItem"];

async function counts(db) {
  const out = {};
  for (const t of TABLES) out[t] = await db[t].count();
  return out;
}

try {
  const [before, existing] = await Promise.all([counts(source), counts(target)]);
  console.log("table           current  new");
  for (const t of TABLES) console.log(`${t.padEnd(15)} ${String(before[t]).padStart(7)}  ${String(existing[t]).padStart(3)}`);
  if (process.argv.includes("--check")) process.exit(0);

  const replace = process.argv.includes("--replace");
  const targetHasData = Object.values(existing).some((n) => n > 0);
  if (targetHasData && !replace) {
    console.error("\n✗ The new database already has data. Use --replace to empty it and copy again.");
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const prompt = replace && targetHasData
    ? 'This EMPTIES the NEW database and copies everything from the current one. Type "yes" to continue: '
    : 'Copy everything from the current database into the new one? Type "yes" to continue: ';
  const answer = (await rl.question(`\n${prompt}`)).trim().toLowerCase();
  rl.close();
  if (answer !== "yes") {
    console.log("Cancelled. Nothing was changed.");
    process.exit(0);
  }

  if (replace) for (const t of [...TABLES].reverse()) await target[t].deleteMany();
  for (const t of TABLES) {
    const rows = await source[t].findMany();
    for (let i = 0; i < rows.length; i += 500) await target[t].createMany({ data: rows.slice(i, i + 500) });
  }

  const after = await counts(target);
  const ok = TABLES.every((t) => after[t] === before[t]);
  console.log(ok ? "\n✓ Copy complete: every table matches." : "\n✗ Counts differ after copying:", ok ? "" : after);
  process.exit(ok ? 0 : 1);
} finally {
  await Promise.all([source.$disconnect(), target.$disconnect()]);
}
