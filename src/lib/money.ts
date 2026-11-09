// Currencies Stripe treats as having no minor unit.
const ZERO_DECIMAL = new Set(["bif","clp","djf","gnf","jpy","kmf","krw","mga","pyg","rwf","ugx","vnd","vuv","xaf","xof","xpf"]);

export function formatMoney(amount: number, currency = "usd") {
  const c = currency.toLowerCase();
  const value = ZERO_DECIMAL.has(c) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c.toUpperCase() }).format(value);
  } catch {
    return `${value.toFixed(2)} ${c.toUpperCase()}`;
  }
}

/** Parse a price typed by an admin ("59.99") into minor units (5999). */
export function parsePriceInput(input: string, currency = "usd"): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(n) : Math.round(n * 100);
}

export function priceToInput(amount: number, currency = "usd") {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? String(amount) : (amount / 100).toFixed(2);
}
