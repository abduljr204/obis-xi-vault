import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderEffects } from "@/components/store/OrderEffects";
import { Crown, Sparkle } from "@/components/ui/Brand";
import { orderStatusLabel } from "@/lib/constants";
import { db } from "@/lib/db";
import { emailEnabled } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { syncStripeSession } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ session_id?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { session_id } = await searchParams;

  let order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  // If we came back from Stripe, confirm the payment directly (webhook may lag).
  if (order.paymentStatus === "PENDING" && session_id && session_id === order.stripeSessionId) {
    await syncStripeSession(order.id, session_id);
    order = (await db.order.findUnique({ where: { id }, include: { items: true } }))!;
  }

  const paid = order.paymentStatus === "PAID";
  const pending = order.paymentStatus === "PENDING";
  const country = new Intl.DisplayNames(["en"], { type: "region" }).of(order.country) ?? order.country;

  return (
    <div className="container-x max-w-4xl pt-12 sm:pt-20">
      <OrderEffects paid={paid} pending={pending && Boolean(session_id)} />

      <div className="animate-fade-up text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-line-strong">
          <Crown className="h-8 w-12" />
          <Sparkle className="animate-twinkle absolute -top-1 -right-1 h-5 w-5" />
        </div>
        <p className="eyebrow mt-8">Order {order.orderNumber}</p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-6xl">
          {paid ? "Thank you!" : pending ? "Confirming payment…" : "Payment not completed"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-mute">
          {paid
            ? emailEnabled()
              ? `Your order is confirmed. We've sent a confirmation to ${order.email} and will email you again with tracking details when it ships.`
              : `Your order is confirmed. We've saved your details and will email ${order.email} when it ships.`
            : pending
              ? "We're waiting for confirmation from the payment provider. This page will update automatically."
              : "Your payment didn't go through and you haven't been charged. You can try again from your cart."}
        </p>
        {order.paymentProvider === "demo" && (
          <p className="mx-auto mt-4 inline-block rounded-full border border-warn/40 px-4 py-1.5 text-xs text-warn">Demo order — payment was simulated</p>
        )}
      </div>

      <div className="animate-fade-up mt-14 grid gap-6 md:grid-cols-[1.4fr_1fr]" style={{ animationDelay: "150ms" }}>
        <section className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Items</h2>
          <ul className="mt-6 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-panel">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-mute">Size {item.size} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm">{formatMoney(item.unitPrice * item.quantity, order.currency)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{order.shippingCost === 0 ? "Free" : formatMoney(order.shippingCost, order.currency)}</dd></div>
            <div className="flex justify-between pt-2 text-base"><dt>Total</dt><dd className="font-display">{formatMoney(order.total, order.currency)}</dd></div>
          </dl>
        </section>

        <section className="card space-y-6 p-6 text-sm sm:p-8">
          <div>
            <h2 className="field-label">Status</h2>
            <p>{paid ? orderStatusLabel(order.status) : pending ? "Awaiting payment" : "Unpaid"}</p>
          </div>
          <div>
            <h2 className="field-label">Ship to</h2>
            <address className="leading-relaxed text-mute not-italic">
              {order.customerName}<br />
              {order.addressLine1}<br />
              {order.addressLine2 && <>{order.addressLine2}<br /></>}
              {order.city}{order.state ? `, ${order.state}` : ""} {order.postalCode}<br />
              {country}
            </address>
          </div>
          <div>
            <h2 className="field-label">Contact</h2>
            <p className="text-mute">{order.email}<br />{order.phone}</p>
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
        {!paid && !pending && <Link href="/cart" className="btn btn-ghost">Back to cart</Link>}
      </div>
    </div>
  );
}
