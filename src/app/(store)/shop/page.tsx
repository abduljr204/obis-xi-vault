import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";
import { Reveal } from "@/components/ui/Reveal";
import { getCatalog, getCollections, SORTS } from "@/lib/catalog";
import { storeConfig } from "@/lib/config";
import { ALL_SIZES, SPORTS, sportFromSlug, sportLabel } from "@/lib/constants";
import { cn, first } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop jerseys" };

type Params = Record<string, string | string[] | undefined>;

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-4 text-xs font-medium tracking-[0.12em] uppercase transition-all duration-300",
        active ? "border-ivory bg-ivory text-ink" : "border-line text-bone hover:border-ivory hover:text-ivory",
      )}
    >
      {children}
    </Link>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const filters = {
    sport: first(sp.sport),
    collection: first(sp.collection),
    size: first(sp.size),
    q: first(sp.q),
    sort: first(sp.sort) ?? "featured",
  };
  const [products, collections] = await Promise.all([getCatalog(filters), getCollections()]);
  const sport = sportFromSlug(filters.sport);

  // Build a link that changes one filter and keeps the rest
  const hrefWith = (key: string, value?: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v && k !== key && !(k === "sort" && v === "featured")) next.set(k, v);
    if (value) next.set(key, value);
    const s = next.toString();
    return `/shop${s ? `?${s}` : ""}`;
  };

  const heading = [filters.collection, sport ? sportLabel(sport) : null].filter(Boolean).join(" · ") || "All jerseys";
  const activeCount = [sport, filters.collection, filters.size, filters.q].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-8">
      <form action="/shop" role="search" className="relative">
        {Object.entries(filters).map(([k, v]) => (k !== "q" && v && !(k === "sort" && v === "featured") ? <input key={k} type="hidden" name={k} value={v} /> : null))}
        <label htmlFor="q" className="sr-only">Search jerseys</label>
        <input id="q" name="q" defaultValue={filters.q} placeholder="Search jerseys…" className="input !rounded-full pr-11" maxLength={60} />
        <button aria-label="Search" className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-mute hover:text-ivory">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </button>
      </form>
      <div>
        <p className="eyebrow mb-3">Sport</p>
        <div className="flex flex-wrap gap-2">
          <Chip href={hrefWith("sport")} active={!sport}>All</Chip>
          {SPORTS.map((s) => (
            <Chip key={s.value} href={hrefWith("sport", s.slug)} active={sport === s.value}>{s.label}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Style / collection</p>
        <div className="flex flex-wrap gap-2">
          <Chip href={hrefWith("collection")} active={!filters.collection}>All</Chip>
          {collections.map((c) => (
            <Chip key={c} href={hrefWith("collection", c)} active={filters.collection === c}>{c}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          <Chip href={hrefWith("size")} active={!filters.size}>Any</Chip>
          {ALL_SIZES.map((s) => (
            <Chip key={s} href={hrefWith("size", s)} active={filters.size === s}>{s}</Chip>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <Link href="/shop" className="inline-block text-xs tracking-[0.2em] text-mute uppercase underline-offset-4 hover:text-ivory hover:underline">
          Clear all filters
        </Link>
      )}
    </div>
  );

  return (
    <div className="container-x pt-10 sm:pt-16">
      <Reveal className="border-b border-line pb-10">
        <p className="eyebrow">The collection</p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-6xl">{heading}</h1>
        {filters.q && <p className="mt-3 text-mute">Results for &ldquo;{filters.q}&rdquo;</p>}
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filterPanel}</div>
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            {/* Mobile filters */}
            <details className="group lg:hidden">
              <summary className="btn btn-ghost btn-sm cursor-pointer list-none">
                Filters {activeCount > 0 && `(${activeCount})`}
              </summary>
              <div className="card absolute inset-x-5 z-30 mt-3 p-6 shadow-2xl shadow-black">{filterPanel}</div>
            </details>
            <p className="hidden text-sm text-mute sm:block" aria-live="polite">
              {products.length} {products.length === 1 ? "jersey" : "jerseys"}
            </p>
            <Suspense>
              <SortSelect options={SORTS} value={filters.sort} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
              <p className="font-display text-2xl">Nothing in the vault matches that.</p>
              <p className="text-mute">Try a different size or collection, or ask us to find it for you.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="btn btn-ghost btn-sm">Clear filters</Link>
                <Link href={`/request${filters.q ? `?team=${encodeURIComponent(filters.q)}` : ""}${sport ? `${filters.q ? "&" : "?"}sport=${sport.toLowerCase()}` : ""}`} className="btn btn-primary btn-sm">Request a jersey</Link>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
              {products.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 80}>
                  <ProductCard product={p} currency={storeConfig.currency} priority={i < 3} />
                </Reveal>
              ))}
            </ul>
          )}
          <div className="card mt-14 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="font-display text-xl font-semibold">Can&rsquo;t find your jersey?</p>
              <p className="mt-1 text-sm text-mute">Tell us the team, season and size, and we&rsquo;ll try to track it down for you.</p>
            </div>
            <Link href="/request" className="btn btn-primary btn-sm shrink-0">Request a jersey</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
