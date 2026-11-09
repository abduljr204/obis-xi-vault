import "server-only";
import type { Prisma } from "@prisma/client";
import { storeConfig, shippingFor } from "./config";
import { db } from "./db";
import { parseSizes } from "./utils";
import type { CheckoutInput } from "./validation";
import { getStripe } from "./stripe";

export class CheckoutError extends Error {}

async function nextOrderNumber(tx: Prisma.TransactionClient) {
  const counter = await tx.counter.upsert({
    where: { id: "order" },
    create: { id: "order", value: 10001 },
    update: { value: { increment: 1 } },
  });
  return `OXV-${counter.value}`;
}

/**
 * Re-prices the cart from the database (never trusting client prices),
 * checks sizes are still available, and saves a PENDING order.
 */
export async function createPendingOrder(input: CheckoutInput) {
  if (!storeConfig.shippingCountries.includes(input.country)) {
    throw new CheckoutError("Sorry, we don't ship to that country yet.");
  }

  // merge duplicate lines (same product + size)
  const merged = new Map<string, { productId: string; size: string; quantity: number }>();
  for (const line of input.items) {
    const key = `${line.productId}:${line.size}`;
    const existing = merged.get(key);
    if (existing) existing.quantity = Math.min(existing.quantity + line.quantity, 10);
    else merged.set(key, { ...line });
  }
  const lines = [...merged.values()];

  const products = await db.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, active: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) throw new CheckoutError("An item in your cart is no longer available. Please review your cart.");
    if (!parseSizes(product.sizes).includes(line.size)) {
      throw new CheckoutError(`${product.name} is no longer available in size ${line.size}.`);
    }
    return {
      productId: product.id,
      productName: product.name,
      collection: product.collection,
      sport: product.sport,
      imageUrl: product.images[0]?.url ?? null,
      size: line.size,
      quantity: line.quantity,
      unitPrice: product.price,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingCost = shippingFor(subtotal);

  return db.$transaction(async (tx) => {
    const orderNumber = await nextOrderNumber(tx);
    return tx.order.create({
      data: {
        orderNumber,
        currency: storeConfig.currency,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        customerNote: input.customerNote,
        items: { create: items },
      },
      include: { items: true },
    });
  });
}

/** Idempotently mark an order paid. */
export async function markOrderPaid(orderId: string, details: { paymentId?: string | null; provider?: string }) {
  await db.order.updateMany({
    where: { id: orderId, paymentStatus: { not: "PAID" } },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      stripePaymentId: details.paymentId ?? undefined,
      paymentProvider: details.provider ?? "stripe",
    },
  });
}

export async function markOrderFailed(orderId: string) {
  await db.order.updateMany({ where: { id: orderId, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED" } });
}

/**
 * Ask Stripe directly whether a Checkout Session was paid. Used on the
 * confirmation page so orders update even before the webhook arrives.
 */
export async function syncStripeSession(orderId: string, sessionId: string) {
  const stripe = getStripe();
  if (!stripe) return;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderId !== orderId) return;
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
      const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      await markOrderPaid(orderId, { paymentId: pi });
    }
  } catch (err) {
    console.error("[stripe] could not verify session", err);
  }
}
