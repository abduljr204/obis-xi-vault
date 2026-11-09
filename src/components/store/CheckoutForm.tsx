"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { checkoutSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { shippingEstimate, useValidatedCart } from "./useValidatedCart";

type Props = {
  countries: string[];
  flatRate: number;
  freeThreshold: number;
  paymentMode: "stripe" | "demo" | "disabled";
  canceled: boolean;
};

const FIELDS = ["customerName", "email", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode", "country", "customerNote"] as const;
type Field = (typeof FIELDS)[number];

function Input({
  name, label, error, className, optional, ...rest
}: { name: Field; label: string; error?: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label} {optional && <span className="tracking-normal text-faint normal-case">(optional)</span>}
      </label>
      <input id={name} name={name} className="input" aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} {...rest} />
      {error && <p id={`${name}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export function CheckoutForm({ countries, flatRate, freeThreshold, paymentMode, canceled }: Props) {
  const { lines, ready, checked, unavailable, subtotal, currency } = useValidatedCart();
  const toast = useToast();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const countryNames = useMemo(() => {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return countries.map((c) => ({ code: c, name: dn.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  const shipping = shippingEstimate(subtotal, flatRate, freeThreshold);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(FIELDS.map((f) => [f, String(fd.get(f) ?? "")]));
    payload.items = lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity }));

    // validate in the browser first for instant feedback…
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = toFieldErrors(parsed.error);
      setErrors(fe);
      const firstField = FIELDS.find((f) => fe[f]);
      if (firstField) document.getElementById(firstField)?.focus();
      if (fe.items) setFormError(fe.items);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      // …and the server validates everything again.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; fieldErrors?: FieldErrors };
      if (!res.ok || !data.url) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        const msg = data.error ?? "Something went wrong. Please try again.";
        setFormError(msg);
        toast(msg, "error");
        setSubmitting(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      toast("Network error — please try again.", "error");
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="card h-96 animate-pulse" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="font-display text-2xl">Your cart is empty</p>
        {unavailable.length > 0 && <p className="text-sm text-warn">Removed: {unavailable.join(", ")} (no longer available).</p>}
        <Link href="/shop" className="btn btn-primary mt-2">Browse jerseys</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_26rem]">
      <div className="space-y-10">
        {canceled && (
          <div role="status" className="rounded-2xl border border-line-strong bg-raise px-5 py-4 text-sm text-bone">
            Payment was cancelled — nothing was charged. Your cart is still here whenever you&rsquo;re ready.
          </div>
        )}
        {paymentMode === "demo" && (
          <div role="note" className="rounded-2xl border border-warn/40 bg-warn/5 px-5 py-4 text-sm text-warn">
            <strong>Demo mode:</strong> Stripe keys aren&rsquo;t configured yet, so payment will be simulated. Orders are still saved and appear in the admin area.
          </div>
        )}
        {paymentMode === "disabled" && (
          <div role="alert" className="rounded-2xl border border-bad/40 bg-bad/5 px-5 py-4 text-sm text-bad">
            Online payment is temporarily unavailable. Please check back soon.
          </div>
        )}
        {unavailable.length > 0 && (
          <div role="alert" className="rounded-2xl border border-warn/40 bg-warn/5 px-5 py-4 text-sm text-warn">
            Removed from your cart (no longer available): {unavailable.join(", ")}.
          </div>
        )}

        <fieldset className="space-y-5">
          <legend className="font-display mb-5 text-2xl font-semibold">Contact</legend>
          <Input name="customerName" label="Full name" autoComplete="name" error={errors.customerName} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="email" label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email} required />
            <Input name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+1 555 123 4567" error={errors.phone} required />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display mb-5 text-2xl font-semibold">Shipping address</legend>
          <Input name="addressLine1" label="Address" autoComplete="address-line1" error={errors.addressLine1} required />
          <Input name="addressLine2" label="Apartment, suite, etc." optional autoComplete="address-line2" error={errors.addressLine2} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="city" label="City" autoComplete="address-level2" error={errors.city} required />
            <Input name="state" label="State / region" optional autoComplete="address-level1" error={errors.state} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="postalCode" label="Postal code" autoComplete="postal-code" error={errors.postalCode} required />
            <div>
              <label htmlFor="country" className="field-label">Country</label>
              <select id="country" name="country" className="input" autoComplete="country" defaultValue="" aria-invalid={!!errors.country}>
                <option value="" disabled>Choose…</option>
                {countryNames.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              {errors.country && <p className="field-error">{errors.country}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="customerNote" className="field-label">
              Order note <span className="tracking-normal text-faint normal-case">(optional)</span>
            </label>
            <textarea id="customerNote" name="customerNote" rows={3} maxLength={500} className="input" placeholder="Anything we should know?" />
            {errors.customerNote && <p className="field-error">{errors.customerNote}</p>}
          </div>
        </fieldset>
      </div>

      <aside className="card h-fit p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-semibold">Your order</h2>
        <ul className="mt-6 max-h-80 space-y-4 overflow-auto pr-1">
          {lines.map((l) => (
            <li key={`${l.productId}-${l.size}`} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-panel">
                {l.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory px-1 text-[0.6rem] font-bold text-ink">{l.quantity}</span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{l.name}</p>
                <p className="text-mute">Size {l.size}</p>
              </div>
              <p className="text-sm">{formatMoney(l.price * l.quantity, currency)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatMoney(subtotal, currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{shipping === 0 ? "Free" : formatMoney(shipping, currency)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 text-base"><dt>Total</dt><dd className="font-display text-lg">{formatMoney(subtotal + shipping, currency)}</dd></div>
        </dl>
        {formError && <p role="alert" className="mt-5 rounded-xl border border-bad/40 bg-bad/5 px-4 py-3 text-sm text-bad">{formError}</p>}
        <button type="submit" className={cn("btn btn-primary mt-6 w-full")} disabled={submitting || !checked || paymentMode === "disabled"}>
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden />
              Processing…
            </>
          ) : paymentMode === "demo" ? (
            "Place order (demo)"
          ) : (
            `Pay ${formatMoney(subtotal + shipping, currency)}`
          )}
        </button>
        <p className="mt-4 text-center text-xs leading-relaxed text-faint">
          {paymentMode === "stripe"
            ? "You'll be taken to Stripe's secure page to pay. We never see or store your card details."
            : "Card details are never stored on our servers."}
        </p>
      </aside>
    </form>
  );
}
