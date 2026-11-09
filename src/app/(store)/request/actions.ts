"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { jerseyRequestSchema, REQUEST_FIELDS, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type RequestFormState = { error?: string; fieldErrors?: FieldErrors; requestNumber?: string };

// Simple in-memory limit so one visitor can't flood the inbox: 5 requests per hour per IP.
const recent = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  return false;
}

export async function submitJerseyRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  // Honeypot: real visitors never see or fill this field; bots usually do.
  if (String(formData.get("website") ?? "")) return { requestNumber: "REQ-RECEIVED" };

  const parsed = jerseyRequestSchema.safeParse(Object.fromEntries(REQUEST_FIELDS.map((f) => [f, String(formData.get(f) ?? "")])));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return { error: "You've sent several requests in the last hour. Please try again later." };

  const created = await db.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { id: "request" },
      create: { id: "request", value: 10001 },
      update: { value: { increment: 1 } },
    });
    return tx.jerseyRequest.create({ data: { requestNumber: `REQ-${counter.value}`, ...parsed.data } });
  });

  return { requestNumber: created.requestNumber };
}
