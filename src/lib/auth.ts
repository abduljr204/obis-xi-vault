import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

// A fixed hash to compare against when the email is unknown, so response time
// doesn't reveal which emails have accounts.
const DUMMY_HASH = "$2b$12$UcWPR3ujXiXqTp4IX7wN2.r0k4wuFbxFmXqwOxP5xJ2VcPGSMirSq";

export async function checkCredentials(email: string, password: string) {
  const admin = await db.admin.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  return ok && admin ? admin : null;
}

export async function startSession(admin: { id: string; email: string }) {
  const token = await signSession({ sub: admin.id, email: admin.email });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Returns the signed-in admin, or null. Confirms the account still exists. */
export async function getAdmin() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return db.admin.findUnique({ where: { id: session.sub }, select: { id: true, email: true, name: true } });
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// ── Simple in-memory login throttle (per IP + email) ─────────
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function loginThrottled(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}
export function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else entry.count++;
}
export function clearLogins(key: string) {
  attempts.delete(key);
}
