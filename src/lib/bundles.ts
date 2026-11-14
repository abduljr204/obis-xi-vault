// Bundle deals. Shared by the cart (in the browser) and checkout (on the server) so both always agree.
// Prices are in cents of the store currency (CAD).
import type { ProductKind } from "./constants";
import { productKind } from "./constants";
import { formatMoney } from "./money";

type BundleKind = Extract<ProductKind, "JERSEY" | "RETRO" | "LONG_SLEEVE">;

export type Bundle = { id: string; label: string; price: number; needs: Partial<Record<BundleKind, number>> };

export const BUNDLES: Bundle[] = [
  { id: "3-jerseys", label: "3 soccer jerseys", price: 11000, needs: { JERSEY: 3 } },
  { id: "3-retro", label: "3 retro jerseys", price: 12500, needs: { RETRO: 3 } },
  { id: "3-long-sleeve", label: "3 long-sleeve jerseys", price: 14000, needs: { LONG_SLEEVE: 3 } },
  { id: "mix", label: "1 soccer + 1 retro + 1 long-sleeve jersey", price: 12500, needs: { JERSEY: 1, RETRO: 1, LONG_SLEEVE: 1 } },
];

const SAME_KIND: Record<BundleKind, Bundle> = {
  JERSEY: BUNDLES[0],
  RETRO: BUNDLES[1],
  LONG_SLEEVE: BUNDLES[2],
};
const MIX = BUNDLES[3];
const KINDS: BundleKind[] = ["JERSEY", "RETRO", "LONG_SLEEVE"];

export type BundleItem = { kind?: string | null; price: number; quantity: number };
export type AppliedBundle = { id: string; label: string; price: number; count: number; saving: number };
export type BundleResult = { discount: number; applied: AppliedBundle[]; leftover: Record<BundleKind, number> };

/**
 * Applies the bundle deals to a cart, choosing the combination that saves the customer the most.
 * A bundle's saving = the normal price of its items − the bundle price (never negative).
 */
export function applyBundles(items: BundleItem[]): BundleResult {
  // One entry per unit, most expensive first, so bundles always use the items that save the most.
  const units: Record<BundleKind, number[]> = { JERSEY: [], RETRO: [], LONG_SLEEVE: [] };
  for (const item of items) {
    if (!item.kind || !(item.kind in units)) continue;
    for (let i = 0; i < item.quantity; i++) units[item.kind as BundleKind].push(item.price);
  }
  for (const k of KINDS) units[k].sort((a, b) => b - a);

  let best: { discount: number; mix: number; same: Record<BundleKind, number> } = { discount: 0, mix: 0, same: { JERSEY: 0, RETRO: 0, LONG_SLEEVE: 0 } };
  const maxMix = Math.min(units.JERSEY.length, units.RETRO.length, units.LONG_SLEEVE.length);

  for (let mix = 0; mix <= maxMix; mix++) {
    // Mix bundles use the top `mix` units of each kind.
    let discount = 0;
    let mixOk = true;
    for (let g = 0; g < mix; g++) {
      const saving = units.JERSEY[g] + units.RETRO[g] + units.LONG_SLEEVE[g] - MIX.price;
      if (saving <= 0) mixOk = false;
      discount += saving;
    }
    if (!mixOk) continue;
    // Then as many "3 of a kind" bundles as still save money.
    const same: Record<BundleKind, number> = { JERSEY: 0, RETRO: 0, LONG_SLEEVE: 0 };
    for (const k of KINDS) {
      const rest = units[k].slice(mix);
      for (let i = 0; i + 3 <= rest.length; i += 3) {
        const saving = rest[i] + rest[i + 1] + rest[i + 2] - SAME_KIND[k].price;
        if (saving <= 0) break;
        same[k]++;
        discount += saving;
      }
    }
    if (discount > best.discount) best = { discount, mix, same };
  }

  const applied: AppliedBundle[] = [];
  if (best.mix > 0) {
    let saving = 0;
    for (let g = 0; g < best.mix; g++) saving += units.JERSEY[g] + units.RETRO[g] + units.LONG_SLEEVE[g] - MIX.price;
    applied.push({ id: MIX.id, label: MIX.label, price: MIX.price, count: best.mix, saving });
  }
  for (const k of KINDS) {
    const count = best.same[k];
    if (!count) continue;
    const used = units[k].slice(best.mix, best.mix + count * 3);
    const saving = used.reduce((s, p) => s + p, 0) - count * SAME_KIND[k].price;
    applied.push({ id: SAME_KIND[k].id, label: SAME_KIND[k].label, price: SAME_KIND[k].price, count, saving });
  }

  const leftover = {
    JERSEY: units.JERSEY.length - best.mix - best.same.JERSEY * 3,
    RETRO: units.RETRO.length - best.mix - best.same.RETRO * 3,
    LONG_SLEEVE: units.LONG_SLEEVE.length - best.mix - best.same.LONG_SLEEVE * 3,
  };
  return { discount: best.discount, applied, leftover };
}

/** "2 × 3 retro jerseys for CA$125.00" */
export function describeBundle(b: AppliedBundle, currency: string) {
  return `${b.count > 1 ? `${b.count} × ` : ""}${b.label} for ${formatMoney(b.price, currency)}`;
}

/** Friendly nudges, e.g. "Add 1 more retro jersey to get 3 for CA$125.00". */
export function bundleHints(result: BundleResult, currency: string): string[] {
  const hints: string[] = [];
  for (const k of KINDS) {
    if (result.leftover[k] === 2) {
      hints.push(`Add 1 more ${productKind(k)?.label.toLowerCase()} to get 3 for ${formatMoney(SAME_KIND[k].price, currency)}.`);
    }
  }
  if (hints.length === 0) {
    const missing = KINDS.filter((k) => result.leftover[k] === 0);
    if (missing.length === 1 && KINDS.every((k) => k === missing[0] || result.leftover[k] >= 1)) {
      hints.push(`Add 1 ${productKind(missing[0])?.label.toLowerCase()} to get the mix bundle: one of each for ${formatMoney(MIX.price, currency)}.`);
    }
  }
  return hints;
}

/** Short offer text for a product page, or null if the product isn't part of a bundle. */
export function bundleOffer(kind: string | null | undefined, currency: string): string | null {
  if (!kind || !(kind in SAME_KIND)) return null;
  const k = kind as BundleKind;
  return `Bundle deal: any 3 ${productKind(k)?.plural} for ${formatMoney(SAME_KIND[k].price, currency)}, or mix 1 soccer + 1 retro + 1 long-sleeve for ${formatMoney(MIX.price, currency)}.`;
}
