import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Returns a Stripe client, or null when STRIPE_SECRET_KEY isn't configured. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key, { appInfo: { name: "Obi's XI Vault" } });
  return client;
}

/**
 * A reusable "Bundle deal" coupon for a fixed amount off (e.g. CA$10.00), created the first time
 * it's needed. One coupon per amount keeps the Stripe dashboard tidy.
 */
export async function bundleCoupon(stripe: Stripe, amountOff: number, currency: string): Promise<string> {
  const id = `bundle-${currency.toLowerCase()}-${amountOff}`;
  try {
    return (await stripe.coupons.retrieve(id)).id;
  } catch (err) {
    if (!(err instanceof Stripe.errors.StripeInvalidRequestError) || err.code !== "resource_missing") throw err;
  }
  try {
    const coupon = await stripe.coupons.create({ id, amount_off: amountOff, currency: currency.toLowerCase(), duration: "once", name: "Bundle deal" });
    return coupon.id;
  } catch (err) {
    // Another checkout created it a moment ago.
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_already_exists") return id;
    throw err;
  }
}
