import { NextResponse } from "next/server";
import { demoPaymentsAllowed, storeConfig } from "@/lib/config";
import { CheckoutError, createPendingOrder, markOrderPaid } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema, toFieldErrors } from "@/lib/validation";

// Basic abuse protection: max 15 checkout attempts per IP per 10 minutes.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 15;
}

/** Stripe only shows public https images (and not SVG). */
function stripeImage(url: string | null, site: string) {
  if (!url) return undefined;
  const absolute = url.startsWith("http") ? url : `${site}${url}`;
  return absolute.startsWith("https://") && !absolute.endsWith(".svg") ? [absolute] : undefined;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) }, { status: 422 });
  }

  const stripe = getStripe();
  if (!stripe && !demoPaymentsAllowed()) {
    return NextResponse.json({ error: "Online payment isn't available right now. Please try again later." }, { status: 503 });
  }

  let order;
  try {
    order = await createPendingOrder(parsed.data);
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[checkout] could not create order", err);
    return NextResponse.json({ error: "We couldn't create your order. Please try again." }, { status: 500 });
  }

  const site = storeConfig.siteUrl;

  // ── Demo mode (no Stripe keys, development only) ────────────
  if (!stripe) {
    await markOrderPaid(order.id, { provider: "demo" });
    return NextResponse.json({ url: `/order/${order.id}` });
  }

  // ── Stripe Checkout (card data handled entirely by Stripe) ──
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber } },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: order.currency,
          unit_amount: item.unitPrice,
          product_data: {
            name: `${item.productName} (Size ${item.size})`,
            description: `${item.collection} collection`,
            images: stripeImage(item.imageUrl, site),
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: order.shippingCost === 0 ? "Free tracked shipping" : "Tracked shipping",
            fixed_amount: { amount: order.shippingCost, currency: order.currency },
          },
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      success_url: `${site}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/checkout?canceled=1`,
    });

    const { db } = await import("@/lib/db");
    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe error", err);
    const { markOrderFailed } = await import("@/lib/orders");
    await markOrderFailed(order.id);
    return NextResponse.json({ error: "Payment provider error. Please try again in a moment." }, { status: 502 });
  }
}
