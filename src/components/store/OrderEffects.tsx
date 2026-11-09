"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";

/** Clears the cart once the order is paid; polls briefly while payment confirms. */
export function OrderEffects({ paid, pending }: { paid: boolean; pending: boolean }) {
  const { clear, ready } = useCart();
  const router = useRouter();
  const tries = useRef(0);

  useEffect(() => {
    if (paid && ready) clear();
  }, [paid, ready, clear]);

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => {
      tries.current += 1;
      if (tries.current > 10) return clearInterval(t);
      router.refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [pending, router]);

  return null;
}
