"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { orderUpdateSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type OrderFormState = { error?: string; fieldErrors?: FieldErrors; ok?: number };

export async function updateOrder(id: string, _prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    status: formData.get("status"),
    trackingNumber: String(formData.get("trackingNumber") ?? ""),
    carrier: String(formData.get("carrier") ?? ""),
    adminNotes: String(formData.get("adminNotes") ?? ""),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const order = await db.order.findUnique({ where: { id }, select: { paymentStatus: true } });
  if (!order) return { error: "Order not found." };
  const { status } = parsed.data;
  if (order.paymentStatus !== "PAID" && ["SENT_TO_SUPPLIER", "SHIPPED", "COMPLETED"].includes(status)) {
    return { error: "This order hasn't been paid. Only paid orders can be sent to the supplier or shipped.", fieldErrors: { status: "Order is not paid" } };
  }

  await db.order.update({
    where: { id },
    data: {
      status,
      trackingNumber: parsed.data.trackingNumber ?? null,
      carrier: parsed.data.carrier ?? null,
      adminNotes: parsed.data.adminNotes ?? null,
    },
  });
  revalidatePath(`/admin/orders/${id}`);
  return { ok: Date.now() };
}

/** One-click status change from the order page / list. */
export async function quickStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!ORDER_STATUS_VALUES.includes(status)) redirect(`/admin/orders/${id}`);
  await db.order.updateMany({ where: { id, paymentStatus: "PAID" }, data: { status } });
  redirect(`/admin/orders/${id}?updated=1`);
}
