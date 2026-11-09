// Server-side store configuration, read from environment variables.
function int(name: string, fallback: number) {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const storeConfig = {
  currency: (process.env.STORE_CURRENCY || "usd").toLowerCase(),
  shippingFlatRate: int("SHIPPING_FLAT_RATE", 999),
  freeShippingThreshold: int("FREE_SHIPPING_THRESHOLD", 15000),
  shippingCountries: (process.env.SHIPPING_COUNTRIES || "US")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c)),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  const { freeShippingThreshold, shippingFlatRate } = storeConfig;
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) return 0;
  return shippingFlatRate;
}

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
/** Demo payments are only ever allowed outside production. */
export const demoPaymentsAllowed = () => !stripeEnabled() && process.env.NODE_ENV !== "production";
