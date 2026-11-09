// Session token helpers. Edge-safe (used by middleware) — no Node-only imports here.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "oxv_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("change-me")) {
    throw new Error("AUTH_SECRET is missing or too short. Set a long random value in .env");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { sub: string; email: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
