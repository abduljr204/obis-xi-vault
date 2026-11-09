"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/Brand";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?sport=football", label: "Football" },
  { href: "/shop?sport=basketball", label: "Basketball" },
  { href: "/shop?collection=New", label: "New in" },
  { href: "/shop?collection=Classic", label: "Classics" },
  { href: "/request", label: "Request a jersey" },
];

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8.5 7.5V6a3.5 3.5 0 0 1 7 0v1.5M5 7.5h14l-1.1 12.1a1.5 1.5 0 0 1-1.5 1.4H7.6a1.5 1.5 0 0 1-1.5-1.4L5 7.5Z" />
    </svg>
  );
}

export function Header() {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const params = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname, params]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // little pop on the cart badge when something is added
  useEffect(() => {
    if (ready && count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count, ready]);

  const current = `${pathname}${params.toString() ? `?${params}` : ""}`;
  const isActive = (href: string) => (href === "/shop" ? current === "/shop" : current === href);

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative py-2 text-[0.7rem] font-medium tracking-[0.24em] uppercase transition-colors",
                isActive(item.href) ? "text-ivory" : "text-mute hover:text-ivory",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ivory transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ivory"
          >
            <CartIcon className="h-5 w-5" />
            {ready && count > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory px-1 text-[0.65rem] font-bold text-ink transition-transform duration-300",
                  bump && "scale-125",
                )}
              >
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 h-px w-5 bg-ivory transition-all duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute top-1.5 left-0 h-px w-5 bg-ivory transition-opacity", open && "opacity-0")} />
              <span className={cn("absolute left-0 h-px w-5 bg-ivory transition-all duration-300", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>
    </header>

      {/* mobile menu — kept outside <header> so the header's blur doesn't clip it */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-[4.5rem] bottom-0 z-40 overflow-y-auto bg-ink transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="container-x flex flex-col pt-6">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-display border-b border-line py-5 text-2xl transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/cart" className="btn btn-primary mt-8">
            View cart {ready && count > 0 ? `(${count})` : ""}
          </Link>
        </nav>
      </div>
    </>
  );
}
