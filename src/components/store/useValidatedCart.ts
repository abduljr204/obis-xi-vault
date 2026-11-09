"use client";

import { useEffect, useRef, useState } from "react";
import { refreshCart } from "@/app/(store)/cart/actions";
import { useCart } from "./CartProvider";

/**
 * Syncs the local cart with the server once per page view: updates prices
 * and names, and reports lines that are no longer available.
 */
export function useValidatedCart() {
  const cart = useCart();
  const [checked, setChecked] = useState(false);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const ran = useRef(false);

  useEffect(() => {
    if (!cart.ready || ran.current) return;
    ran.current = true;
    if (cart.lines.length === 0) {
      setChecked(true);
      return;
    }
    refreshCart(cart.lines.map((l) => ({ productId: l.productId, size: l.size })))
      .then((fresh) => {
        const gone: string[] = [];
        const next = cart.lines.flatMap((line) => {
          const f = fresh.find((x) => x.productId === line.productId && x.size === line.size);
          if (!f || !f.available || !("product" in f) || !f.product) {
            gone.push(`${line.name} (${line.size})`);
            return [];
          }
          return [{ ...line, ...f.product }];
        });
        cart.replace(next);
        setUnavailable(gone);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [cart]);

  return { ...cart, checked, unavailable };
}

export function shippingEstimate(subtotal: number, flat: number, threshold: number) {
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return flat;
}
