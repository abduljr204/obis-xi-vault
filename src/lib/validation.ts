import { z } from "zod";
import { ALL_SIZES, MAX_CART_LINES, MAX_QTY_PER_LINE, MAX_REQUEST_QTY, ORDER_STATUS_VALUES, REQUEST_STATUS_VALUES, SPORT_VALUES } from "./constants";

export type FieldErrors = Record<string, string>;

/** Turn zod issues into { fieldName: "first message" } for forms. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const text = (label: string, max: number) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const optionalText = (max: number) =>
  z.string().trim().max(max, "Too long").optional().transform((v) => (v ? v : undefined));

// ── Checkout ────────────────────────────────────────────────
export const cartLineSchema = z.object({
  productId: z.string().min(1).max(50),
  size: z.enum(ALL_SIZES, { error: "Invalid size" }),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(MAX_QTY_PER_LINE, `Maximum ${MAX_QTY_PER_LINE} per item`),
});

export const checkoutSchema = z.object({
  customerName: text("Full name", 100),
  email: z.string({ error: "Email is required" }).trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .regex(/^\+?[0-9 ()\-.]{7,20}$/, "Enter a valid phone number"),
  addressLine1: text("Address", 160),
  addressLine2: optionalText(160),
  city: text("City", 80),
  state: optionalText(80),
  postalCode: z.string({ error: "Postal code is required" }).trim().min(2, "Postal code is required").max(16, "Postal code is too long"),
  country: z.string({ error: "Choose a country" }).trim().toUpperCase().regex(/^[A-Z]{2}$/, "Choose a country"),
  customerNote: optionalText(500),
  items: z.array(cartLineSchema).min(1, "Your cart is empty").max(MAX_CART_LINES, "Too many items in cart"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Jersey request (public form) ────────────────────────────
export const jerseyRequestSchema = z.object({
  name: text("Your name", 100),
  email: z.string({ error: "Email is required" }).trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.string().regex(/^\+?[0-9 ()\-.]{7,20}$/, "Enter a valid phone number").optional()),
  sport: z.enum(SPORT_VALUES, { error: "Choose a sport" }),
  team: text("Team", 100),
  season: optionalText(80),
  player: optionalText(80),
  size: z.enum(ALL_SIZES, { error: "Choose a size" }),
  quantity: z.coerce.number({ error: "Enter a quantity" }).int("Enter a whole number").min(1, "At least 1").max(MAX_REQUEST_QTY, `Maximum ${MAX_REQUEST_QTY}`),
  budget: optionalText(60),
  referenceUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).max(500, "Link is too long").optional()),
  notes: optionalText(1000),
});
export const REQUEST_FIELDS = ["name", "email", "phone", "sport", "team", "season", "player", "size", "quantity", "budget", "referenceUrl", "notes"] as const;
export type JerseyRequestInput = z.infer<typeof jerseyRequestSchema>;

export const requestUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUS_VALUES, { error: "Choose a status" }),
  adminNotes: optionalText(2000),
});

// ── Admin: products ─────────────────────────────────────────
export const productSchema = z.object({
  name: text("Name", 120),
  collection: text("Style / collection", 40),
  sport: z.enum(SPORT_VALUES, { error: "Choose a sport" }),
  price: z.number({ error: "Enter a valid price" }).int().min(50, "Price must be at least 0.50").max(10_000_00, "Price is too high"),
  description: text("Description", 4000),
  sizes: z.array(z.enum(ALL_SIZES)).min(1, "Pick at least one size"),
  featured: z.boolean(),
  active: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;

// ── Admin: orders ───────────────────────────────────────────
export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES, { error: "Choose a status" }),
  trackingNumber: optionalText(100),
  carrier: optionalText(60),
  adminNotes: optionalText(2000),
});

// ── Admin: login ────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password").max(200),
});
