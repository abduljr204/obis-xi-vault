"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { Sparkle } from "@/components/ui/Brand";
import { MAX_QTY_PER_LINE, sportLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { shippingEstimate, useValidatedCart } from "./useValidatedCart";

export function CartView({ flatRate, freeThreshold }: { flatRate: number; freeThreshold: number }) {
  const { lines, ready, checked, unavailable, subtotal, currency, setQuantity, remove } = useValidatedCart();
  const toast = useToast();
  const shipping = shippingEstimate(subtotal, flatRate, freeThreshold);
  const toFree = freeThreshold > 0 ? freeThreshold - subtotal : 0;

  if (!ready) {
    return <div className="card h-64 animate-pulse" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-24 text-center">
        <Sparkle className="h-6 w-6 animate-twinkle" />
        <p className="font-display text-2xl sm:text-3xl">Your cart is empty</p>
        <p className="text-mute">The vault is full of kits waiting for you.</p>
        {unavailable.length > 0 && <p className="text-sm text-warn">Removed: {unavailable.join(", ")} (no longer available).</p>}
        <Link href="/shop" className="btn btn-primary mt-4">Browse jerseys</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        {unavailable.length > 0 && (
          <div role="alert" className="mb-6 rounded-2xl border border-warn/40 bg-warn/5 px-5 py-4 text-sm text-warn">
            We removed {unavailable.join(", ")} from your cart because {unavailable.length === 1 ? "it is" : "they are"} no longer available.
          </div>
        )}
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.size}`} className="animate-fade-in flex gap-4 py-6 sm:gap-6">
              <Link href={`/product/${line.slug}`} className="h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-panel sm:h-36 sm:w-28">
                {line.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.image} alt="" className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow !text-[0.58rem]">{line.collection} · {sportLabel(line.sport)}</p>
                    <Link href={`/product/${line.slug}`} className="mt-1 block font-medium hover:underline">{line.name}</Link>
                    <p className="mt-1 text-sm text-mute">Size {line.size}</p>
                  </div>
                  <p className="font-display shrink-0">{formatMoney(line.price * line.quantity, currency)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 items-center rounded-full border border-line-strong">
                    <button type="button" aria-label={`Decrease quantity of ${line.name}`} className="h-full w-10 text-bone hover:text-ivory" onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}>−</button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                    <button type="button" aria-label={`Increase quantity of ${line.name}`} className="h-full w-10 text-bone hover:text-ivory disabled:opacity-30" disabled={line.quantity >= MAX_QTY_PER_LINE} onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}>+</button>
                  </div>
                  <button
                    type="button"
                    className="text-xs tracking-[0.16em] text-mute uppercase underline-offset-4 hover:text-bad hover:underline"
                    onClick={() => {
                      remove(line.productId, line.size);
                      toast(`Removed ${line.name} (${line.size})`, "info");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="mt-6 inline-block text-sm text-mute hover:text-ivory">← Continue shopping</Link>
      </div>

      <aside className="card h-fit p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-semibold">Order summary</h2>
        {toFree > 0 && (
          <div className="mt-5">
            <p className="text-xs text-mute">Add {formatMoney(toFree, currency)} more for free shipping</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-ivory transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }} />
            </div>
          </div>
        )}
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatMoney(subtotal, currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{shipping === 0 ? "Free" : formatMoney(shipping, currency)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 text-base"><dt>Total</dt><dd className="font-display text-lg">{formatMoney(subtotal + shipping, currency)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn btn-primary mt-8 w-full" aria-disabled={!checked}>
          Checkout
        </Link>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-faint">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          Secure payment with Stripe
        </p>
      </aside>
    </div>
  );
}
