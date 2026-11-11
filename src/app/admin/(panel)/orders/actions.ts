"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { emailEnabled } from "@/lib/email";
import { sendOrderShippedEmail } from "@/lib/order-emails";
import { orderUpdateSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type OrderFormState = { error?: string; fieldErrors?: FieldErrors; ok?: number; notice?: string };

export async function updateOrder(id: string, _prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    status: formData.get("status"),
    trackingNumber: String(formData.get("trackingNumber") ?? ""),
    carrier: String(formData.get("carrier") ?? ""),
    adminNotes: String(formData.get("adminNotes") ?? ""),
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const order = await db.order.findUnique({ where: { id }, select: { paymentStatus: true, status: true, trackingNumber: true } });
  if (!order) return { error: "Order not found." };
  const { status } = parsed.data;
  if (order.paymentStatus !== "PAID" && ["SENT_TO_SUPPLIER", "SHIPPED", "COMPLETED"].includes(status)) {
    return { error: "This order hasn't been paid. Only paid orders can be sent to the supplier or shipped.", fieldErrors: { status: "Order is not paid" } };
  }

  const trackingNumber = parsed.data.trackingNumber ?? null;
  await db.order.update({
    where: { id },
    data: {
      status,
      trackingNumber,
      carrier: parsed.data.carrier ?? null,
      adminNotes: parsed.data.adminNotes ?? null,
    },
  });
  revalidatePath(`/admin/orders/${id}`);

  // Email the customer when the order becomes Shipped, or when a tracking number is added/changed later.
  const justShipped = status === "SHIPPED" && order.status !== "SHIPPED";
  const newTracking = status === "SHIPPED" && !!trackingNumber && trackingNumber !== order.trackingNumber;
  if (justShipped || newTracking) {
    if (!emailEnabled()) return { ok: Date.now(), notice: "Order updated. Customer emails aren't set up, so the customer wasn't notified." };
    after(() => sendOrderShippedEmail(id));
    return { ok: Date.now(), notice: trackingNumber ? "Order updated. Tracking details emailed to the customer." : "Order updated. Shipping email sent to the customer." };
  }
  return { ok: Date.now() };
}

/** One-click status change from the order page / list. */
export async function quickStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!ORDER_STATUS_VALUES.includes(status)) redirect(`/admin/orders/${id}`);

  if (status === "SHIPPED") {
    const { count } = await db.order.updateMany({ where: { id, paymentStatus: "PAID", status: { not: "SHIPPED" } }, data: { status } });
    if (count === 1) {
      if (!emailEnabled()) redirect(`/admin/orders/${id}?updated=1&emailed=off`);
      after(() => sendOrderShippedEmail(id));
      redirect(`/admin/orders/${id}?updated=1&emailed=1`);
    }
  } else {
    await db.order.updateMany({ where: { id, paymentStatus: "PAID" }, data: { status } });
  }
  redirect(`/admin/orders/${id}?updated=1`);
}
