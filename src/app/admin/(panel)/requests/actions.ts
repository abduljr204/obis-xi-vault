"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { requestUpdateSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type RequestUpdateState = { error?: string; fieldErrors?: FieldErrors; ok?: number };

export async function updateRequest(id: string, _prev: RequestUpdateState, formData: FormData): Promise<RequestUpdateState> {
  await requireAdmin();
  const parsed = requestUpdateSchema.safeParse({
    status: formData.get("status"),
    adminNotes: String(formData.get("adminNotes") ?? ""),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const found = await db.jerseyRequest.updateMany({
    where: { id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes ?? null },
  });
  if (!found.count) return { error: "Request not found." };
  revalidatePath(`/admin/requests/${id}`);
  return { ok: Date.now() };
}

export async function deleteRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.jerseyRequest.deleteMany({ where: { id } });
  redirect("/admin/requests?deleted=1");
}
