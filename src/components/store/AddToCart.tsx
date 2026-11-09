"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { ALL_SIZES, MAX_QTY_PER_LINE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

type Props = {
  product: { id: string; slug: string; name: string; collection: string; sport: string; price: number; image: string | null };
  sizes: string[];
};

export function AddToCart({ product, sizes }: Props) {
  const { add } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function addToCart() {
    if (!size) {
      setError("Please choose a size first.");
      return false;
    }
    setError(null);
    const ok = add({ productId: product.id, slug: product.slug, name: product.name, collection: product.collection, sport: product.sport, price: product.price, image: product.image, size }, qty);
    if (!ok) {
      toast("Your cart is full. Remove an item to add more.", "error");
      return false;
    }
    return true;
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="field-label !mb-0">Size {size && <span className="text-mute">· {size}</span>}</legend>
          <details className="relative text-xs text-mute">
            <summary className="cursor-pointer list-none underline-offset-4 hover:text-ivory hover:underline">Size guide</summary>
            <div className="card absolute right-0 z-20 mt-2 w-64 p-4 text-left text-xs leading-relaxed shadow-2xl shadow-black">
              Chest (cm): XS 86 · S 92 · M 98 · L 104 · XL 110 · XXL 116 · 3XL 122. Between sizes? We recommend sizing up for a relaxed fit.
            </div>
          </details>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Choose size" aria-invalid={!!error}>
          {ALL_SIZES.map((s) => {
            const available = sizes.includes(s);
            const selected = size === s;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!available}
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                className={cn(
                  "h-12 rounded-xl border text-sm font-medium transition-all duration-200",
                  selected && "scale-[1.03] border-ivory bg-ivory text-ink",
                  !selected && available && "border-line-strong hover:border-ivory",
                  !available && "cursor-not-allowed border-line text-faint line-through",
                )}
                title={available ? `Size ${s}` : `${s} unavailable`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 items-center rounded-full border border-line-strong" aria-label="Quantity">
          <button type="button" className="h-full w-12 text-lg text-bone hover:text-ivory disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center tabular-nums" aria-live="polite">{qty}</span>
          <button type="button" className="h-full w-12 text-lg text-bone hover:text-ivory disabled:opacity-30" onClick={() => setQty((q) => Math.min(MAX_QTY_PER_LINE, q + 1))} disabled={qty >= MAX_QTY_PER_LINE} aria-label="Increase quantity">+</button>
        </div>
        <button
          type="button"
          className="btn btn-primary flex-1"
          disabled={sizes.length === 0}
          onClick={() => {
            if (addToCart()) {
              setAdded(true);
              toast(`${product.name} (${size}) added to your cart`);
              setTimeout(() => setAdded(false), 2200);
            }
          }}
        >
          {sizes.length === 0 ? "Sold out" : added ? "Added ✦" : "Add to cart"}
        </button>
      </div>
      <button
        type="button"
        className="btn btn-ghost w-full"
        disabled={sizes.length === 0}
        onClick={() => {
          if (addToCart()) router.push("/checkout");
        }}
      >
        Buy now
      </button>
      {added && (
        <p className="animate-fade-in text-center text-sm text-mute">
          <Link href="/cart" className="text-ivory underline underline-offset-4">View cart</Link> or keep browsing.
        </p>
      )}
    </div>
  );
}
