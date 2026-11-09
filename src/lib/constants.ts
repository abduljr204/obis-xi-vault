export const STORE_NAME = "Obi's XI Vault";
export const STORE_TAGLINE = "Football Jerseys × Classics × More";

export const SPORTS = [
  { value: "FOOTBALL", label: "Football", slug: "football" },
  { value: "BASKETBALL", label: "Basketball", slug: "basketball" },
] as const;
export type Sport = (typeof SPORTS)[number]["value"];
export const SPORT_VALUES = SPORTS.map((s) => s.value) as [Sport, ...Sport[]];

export function sportLabel(value: string) {
  return SPORTS.find((s) => s.value === value)?.label ?? value;
}
export function sportFromSlug(slug?: string | null): Sport | undefined {
  if (!slug) return undefined;
  return SPORTS.find((s) => s.slug === slug.toLowerCase() || s.value === slug.toUpperCase())?.value;
}

export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type Size = (typeof ALL_SIZES)[number];

/** Suggested collections — admins may also type their own. */
export const SUGGESTED_COLLECTIONS = ["New", "Metro", "Classic", "Retro", "Limited"];

export const ORDER_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "SENT_TO_SUPPLIER", label: "Sent to supplier" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];
export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((s) => s.value) as [OrderStatus, ...OrderStatus[]];

export const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed / expired" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

export function orderStatusLabel(v: string) {
  return ORDER_STATUSES.find((s) => s.value === v)?.label ?? v;
}
export function paymentStatusLabel(v: string) {
  return PAYMENT_STATUSES.find((s) => s.value === v)?.label ?? v;
}

export const MAX_QTY_PER_LINE = 10;
export const MAX_CART_LINES = 30;

// ── Jersey requests (customers asking us to source a jersey) ─
export const REQUEST_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "SOURCING", label: "Sourcing" },
  { value: "QUOTED", label: "Quote sent" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "DECLINED", label: "Declined" },
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number]["value"];
export const REQUEST_STATUS_VALUES = REQUEST_STATUSES.map((s) => s.value) as [RequestStatus, ...RequestStatus[]];
export function requestStatusLabel(v: string) {
  return REQUEST_STATUSES.find((s) => s.value === v)?.label ?? v;
}
export const MAX_REQUEST_QTY = 20;
