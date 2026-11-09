import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/Badges";
import { CopyBlock } from "@/components/admin/CopyBlock";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { FlashToast } from "@/components/ui/Toast";
import { sportLabel } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { quickStatus, updateOrder } from "../actions";

export const metadata: Metadata = { title: "Order" };

const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
  NEW: { status: "SENT_TO_SUPPLIER", label: "Mark as sent to supplier" },
  SENT_TO_SUPPLIER: { status: "SHIPPED", label: "Mark as shipped" },
  SHIPPED: { status: "COMPLETED", label: "Mark as completed" },
};

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ updated?: string }> }) {
  const { id } = await params;
  const { updated } = await searchParams;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const countryName = new Intl.DisplayNames(["en"], { type: "region" }).of(order.country) ?? order.country;
  const paid = order.paymentStatus === "PAID";
  const next = paid ? NEXT_STEP[order.status] : undefined;

  const addressLines = [
    order.customerName,
    order.addressLine1,
    order.addressLine2,
    [order.city, order.state, order.postalCode].filter(Boolean).join(", "),
    countryName,
  ].filter(Boolean);

  // Plain-text summary for sending to the supplier (copy or email).
  const supplierText = [
    `ORDER ${order.orderNumber}`,
    `Date: ${order.createdAt.toISOString().slice(0, 10)}`,
    "",
    "ITEMS",
    ...order.items.map((i) => `- ${i.quantity} x ${i.productName} | Size: ${i.size} | ${i.collection} / ${sportLabel(i.sport)}`),
    "",
    "SHIP TO",
    ...addressLines,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    ...(order.customerNote ? ["", `Customer note: ${order.customerNote}`] : []),
  ].join("\n");

  const supplierEmail = process.env.SUPPLIER_EMAIL?.trim();
  const mailto = supplierEmail
    ? `mailto:${supplierEmail}?subject=${encodeURIComponent(`New order ${order.orderNumber}`)}&body=${encodeURIComponent(supplierText)}`
    : undefined;

  return (
    <div className="space-y-8">
      <FlashToast message={updated ? "Status updated" : null} />
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link href="/admin/orders" className="text-xs tracking-[0.16em] text-mute uppercase hover:text-ivory">← Orders</Link>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{order.orderNumber}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mute">
            <PaymentBadge status={order.paymentStatus} />
            <OrderStatusBadge status={order.status} />
            <span>· Placed {order.createdAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</span>
            {order.paymentProvider === "demo" && <span className="text-warn">· Demo payment</span>}
          </div>
        </div>
        {next && (
          <form action={quickStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={next.status} />
            <button className="btn btn-primary btn-sm">{next.label} →</button>
          </form>
        )}
      </header>

      {!paid && (
        <div className="rounded-2xl border border-warn/40 bg-warn/5 px-5 py-4 text-sm text-warn">
          {order.paymentStatus === "PENDING"
            ? "Payment hasn't been confirmed yet. Don't send this order to your supplier until it shows as Paid."
            : order.paymentStatus === "REFUNDED"
              ? "This order was refunded."
              : "Payment failed or the checkout expired. No money was taken — don't fulfil this order."}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <h2 className="font-display border-b border-line px-6 py-4 text-lg font-semibold">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-16 w-13 shrink-0 overflow-hidden rounded-lg border border-line bg-panel">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="font-medium hover:underline">{item.productName}</Link>
                    ) : (
                      <p className="font-medium">{item.productName} <span className="text-xs text-faint">(deleted)</span></p>
                    )}
                    <p className="text-xs text-mute">{item.collection} · {sportLabel(item.sport)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-faint">Size</p>
                    <p className="font-display text-lg font-bold">{item.size}</p>
                  </div>
                  <div className="w-14 text-center">
                    <p className="text-xs text-faint">Qty</p>
                    <p className="font-display text-lg font-bold">{item.quantity}</p>
                  </div>
                  <p className="w-24 text-right text-sm">{formatMoney(item.unitPrice * item.quantity, order.currency)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-6 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{formatMoney(order.shippingCost, order.currency)}</dd></div>
              <div className="flex justify-between text-base"><dt>Total</dt><dd className="font-display">{formatMoney(order.total, order.currency)}</dd></div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-semibold">Send to supplier</h2>
            <p className="mt-1 mb-4 text-sm text-mute">Copy these details to your supplier, then mark the order as &ldquo;Sent to supplier&rdquo;.</p>
            <CopyBlock text={supplierText} mailto={mailto} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-5 p-6 text-sm">
            <div>
              <h2 className="field-label">Customer</h2>
              <p>{order.customerName}</p>
              <p><a href={`mailto:${order.email}`} className="text-mute hover:text-ivory hover:underline">{order.email}</a></p>
              <p><a href={`tel:${order.phone.replace(/[^+0-9]/g, "")}`} className="text-mute hover:text-ivory hover:underline">{order.phone}</a></p>
            </div>
            <div>
              <h2 className="field-label">Shipping address</h2>
              <address className="leading-relaxed text-mute not-italic">
                {addressLines.map((l, i) => <span key={i} className="block">{l}</span>)}
              </address>
            </div>
            {order.customerNote && (
              <div>
                <h2 className="field-label">Customer note</h2>
                <p className="text-mute whitespace-pre-line">{order.customerNote}</p>
              </div>
            )}
            <div>
              <h2 className="field-label">Payment</h2>
              <p className="text-mute">
                {order.paymentProvider === "demo" ? "Demo (simulated)" : "Stripe"}
                {order.paidAt && ` · paid ${order.paidAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`}
              </p>
              {order.stripePaymentId && (
                <a
                  href={`https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") ? "test/" : ""}payments/${order.stripePaymentId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-mute underline underline-offset-4 hover:text-ivory"
                >
                  View in Stripe ↗
                </a>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display mb-5 text-lg font-semibold">Update order</h2>
            <OrderUpdateForm
              action={updateOrder.bind(null, order.id)}
              paid={paid}
              initial={{
                status: order.status,
                trackingNumber: order.trackingNumber ?? "",
                carrier: order.carrier ?? "",
                adminNotes: order.adminNotes ?? "",
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
