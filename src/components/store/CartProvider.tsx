"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_CART_LINES, MAX_QTY_PER_LINE } from "@/lib/constants";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  collection: string;
  sport: string;
  price: number; // display only — the server re-prices at checkout
  image: string | null;
  size: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  currency: string;
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => boolean;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  replace: (lines: CartLine[]) => void;
  clear: () => void;
};

const STORAGE_KEY = "oxv-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is CartLine =>
        l && typeof l.productId === "string" && typeof l.size === "string" && Number.isInteger(l.quantity) && l.quantity > 0,
    )
    .map((l) => ({ ...l, quantity: Math.min(l.quantity, MAX_QTY_PER_LINE) }))
    .slice(0, MAX_CART_LINES);
}

export function CartProvider({ children, currency }: { children: React.ReactNode; currency: string }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // load once on the client
  useEffect(() => {
    try {
      setLines(sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")));
    } catch {
      setLines([]);
    }
    setReady(true);
    // keep several open tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setLines(sanitize(JSON.parse(e.newValue || "[]")));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    let ok = true;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === line.productId && l.size === line.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], ...line, quantity: Math.min(next[i].quantity + quantity, MAX_QTY_PER_LINE) };
        return next;
      }
      if (prev.length >= MAX_CART_LINES) {
        ok = false;
        return prev;
      }
      return [...prev, { ...line, quantity: Math.min(quantity, MAX_QTY_PER_LINE) }];
    });
    return ok;
  }, []);

  const setQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId && l.size === size
            ? { ...l, quantity: Math.max(0, Math.min(quantity, MAX_QTY_PER_LINE)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  }, []);

  const replace = useCallback((next: CartLine[]) => setLines(sanitize(next)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      currency,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      add,
      setQuantity,
      remove,
      replace,
      clear,
    }),
    [lines, currency, ready, add, setQuantity, remove, replace, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
