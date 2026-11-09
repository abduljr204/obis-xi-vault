"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SortSelect({ options, value }: { options: readonly { value: string; label: string }[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-3">
      <span className="eyebrow hidden sm:inline">Sort</span>
      <select
        className="input !min-h-10 !w-auto !rounded-full !py-1.5 text-sm"
        value={value}
        aria-label="Sort products"
        disabled={pending}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
