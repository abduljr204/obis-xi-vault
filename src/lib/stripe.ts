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
