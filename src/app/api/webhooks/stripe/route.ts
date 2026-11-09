import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { markOrderFailed, markOrderPaid } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook. Configure in Stripe → Developers → Webhooks with:
 *   URL:    https://YOUR-DOMAIN/api/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *           checkout.session.async_payment_failed, checkout.session.expired, charge.refunded
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // signature check needs the raw, unparsed body
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("[stripe webhook] bad signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId && (session.payment_status === "paid" || session.payment_status === "no_payment_required")) {
          const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          await markOrderPaid(orderId, { paymentId: pi });
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) await markOrderFailed(orderId);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) {
          await db.order.updateMany({ where: { stripePaymentId: pi }, data: { paymentStatus: "REFUNDED" } });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 }); // Stripe will retry
  }

  return NextResponse.json({ received: true });
}
