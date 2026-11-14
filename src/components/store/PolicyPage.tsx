import Link from "next/link";
import type { ReactNode } from "react";
import { POLICIES_UPDATED } from "@/lib/constants";

const POLICY_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns & refunds" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms of sale" },
];

/** Shared layout for the contact and policy pages. */
export function PolicyPage({ eyebrow, title, intro, current, children }: { eyebrow: string; title: string; intro?: ReactNode; current: string; children: ReactNode }) {
  return (
    <section className="container-x max-w-3xl py-14 sm:py-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
      {intro && <p className="mt-6 text-base leading-relaxed text-bone">{intro}</p>}
      <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-mute [&_a]:text-ivory [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-bone [&_li]:mt-2 [&_strong]:font-semibold [&_strong]:text-bone [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-12 text-xs text-faint">Last updated {POLICIES_UPDATED}</p>
      <nav aria-label="Store policies" className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
        {POLICY_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.href === current ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${l.href === current ? "border-ivory bg-ivory text-ink" : "border-line text-mute hover:border-bone hover:text-ivory"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold text-ivory sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}
