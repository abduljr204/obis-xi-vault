"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, clearLogins, endSession, loginThrottled, recordFailedLogin, startSession } from "@/lib/auth";
import { loginSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type LoginState = { error?: string; fieldErrors?: FieldErrors; email?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error), email };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${parsed.data.email}`;
  if (loginThrottled(key)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again.", email };
  }

  const admin = await checkCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    recordFailedLogin(key);
    return { error: "Incorrect email or password.", email };
  }
  clearLogins(key);
  await startSession(admin);

  // only allow redirecting back inside the admin area
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login?out=1");
}
