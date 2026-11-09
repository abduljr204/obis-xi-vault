"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Crown } from "@/components/ui/Brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
  { href: "/admin/orders", label: "Orders", icon: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8" },
  { href: "/admin/products", label: "Products", icon: "M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9l-2 1-3-3z" },
];

export function AdminNav({ email, logout }: { email: string; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <>
      <nav className="flex-1 space-y-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
              active(l.href) ? "bg-ivory text-ink" : "text-bone hover:bg-raise hover:text-ivory",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={l.icon} /></svg>
            {l.label}
          </Link>
        ))}
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-mute hover:bg-raise hover:text-ivory">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></svg>
          View store
        </Link>
      </nav>
      <div className="border-t border-line pt-4">
        <p className="truncate px-4 text-xs text-faint" title={email}>{email}</p>
        <form action={logout}>
          <button className="mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm text-mute hover:bg-raise hover:text-ivory">Sign out</button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink/90 px-5 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display font-bold">
          <Crown className="h-4 w-7" /> Vault Admin
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-ghost btn-sm">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && <div className="fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col bg-ink p-5 lg:hidden">{nav}</div>}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-coal p-5 lg:flex">
        <Link href="/admin" className="mb-10 flex items-center gap-3 px-2 pt-2">
          <Crown className="h-5 w-8" />
          <span className="leading-tight">
            <span className="font-display block font-bold">OBI&rsquo;S XI VAULT</span>
            <span className="eyebrow !text-[0.55rem]">Admin</span>
          </span>
        </Link>
        {nav}
      </aside>
    </>
  );
}
