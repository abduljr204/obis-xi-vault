// Create an admin account, or reset its password.
//   npm run admin:create                                  (asks questions)
//   npm run admin:create -- you@email.com "a-strong-password"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";

const db = new PrismaClient();

async function main() {
  let [email, password] = process.argv.slice(2);
  if (!email || !password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    email = email || (await rl.question("Admin email: "));
    password = password || (await rl.question("Password (min 10 characters): "));
    rl.close();
  }
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That doesn't look like an email address.");
  if (!password || password.length < 10) throw new Error("Password must be at least 10 characters.");

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.admin.findUnique({ where: { email } });
  await db.admin.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash } });
  console.log(existing ? `✓ Password updated for ${email}` : `✓ Admin created: ${email}`);
  console.log("  Sign in at /admin/login");
}

main()
  .catch((e) => {
    console.error("✗", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
