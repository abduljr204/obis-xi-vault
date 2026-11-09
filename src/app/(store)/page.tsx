import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { Crown, Sparkle } from "@/components/ui/Brand";
import { Reveal } from "@/components/ui/Reveal";
import { getFeatured } from "@/lib/catalog";
import { storeConfig } from "@/lib/config";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const MARQUEE = ["Football jerseys", "Classics", "Basketball", "Metro collection", "New drops", "Retro kits", "More"];

const COLLECTIONS = [
  { name: "Metro", line: "Modern city kits, clean lines" },
  { name: "Classic", line: "Shirts that defined an era" },
  { name: "New", line: "The latest drop, fresh in the vault" },
  { name: "Retro", line: "Throwback cuts, vintage feel" },
];

export default async function HomePage() {
  const featured = await getFeatured(8);
  const currency = storeConfig.currency;
  const free = storeConfig.freeShippingThreshold;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="grain relative -mt-[4.5rem] overflow-hidden pt-[4.5rem]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory/[0.05] blur-3xl lg:left-[70%]" />
          <svg className="absolute right-[-10%] bottom-[12%] w-[85%] text-ivory/25 lg:w-[60%]" viewBox="0 0 600 120" fill="none">
            <path
              d="M2 110 C 180 60, 380 30, 598 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="900"
              strokeDashoffset="900"
              style={{ animation: "draw 2.4s 0.4s cubic-bezier(.16,1,.3,1) forwards" }}
            />
          </svg>
        </div>

        <div className="container-x relative grid items-center gap-6 py-8 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-20">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="eyebrow animate-fade-up flex items-center justify-center gap-3 lg:justify-start">
              <Sparkle className="h-3 w-3 animate-twinkle text-ivory" /> The vault is open
            </p>
            <h1
              className="font-display animate-fade-up mt-6 text-[2.6rem] leading-[1.02] font-bold sm:text-6xl xl:text-7xl"
              style={{ animationDelay: "120ms" }}
            >
              Every shirt
              <br />
              tells a <span className="italic text-bone">story.</span>
            </h1>
            <p
              className="animate-fade-up mx-auto mt-6 max-w-md text-base leading-relaxed text-mute lg:mx-0 lg:text-lg"
              style={{ animationDelay: "220ms" }}
            >
              Football and basketball jerseys, curated. From sharp Metro kits to the classics you grew up watching.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "320ms" }}>
              <Link href="/shop" className="btn btn-primary">
                Shop the vault <span aria-hidden>→</span>
              </Link>
              <Link href="/shop?collection=New" className="btn btn-ghost">
                New arrivals
              </Link>
            </div>
            <dl className="animate-fade-up mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6 text-left" style={{ animationDelay: "420ms" }}>
              <div>
                <dt className="eyebrow !text-[0.58rem]">Sports</dt>
                <dd className="font-display mt-1 text-lg">Football · Hoops</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.58rem]">Sizes</dt>
                <dd className="font-display mt-1 text-lg">XS to 3XL</dd>
              </div>
              <div>
                <dt className="eyebrow !text-[0.58rem]">Shipping</dt>
                <dd className="font-display mt-1 text-lg">{free > 0 ? `Free ${formatMoney(free, currency).replace(/\.00$/, "")}+` : "Tracked"}</dd>
              </div>
            </dl>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[13rem] sm:max-w-xs lg:order-2 lg:max-w-none">
            <div className="animate-fade-in relative aspect-[818/1080] animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.jpg"
                alt="Obi's XI Vault crest"
                className="h-full w-full object-contain mix-blend-lighten [mask-image:radial-gradient(closest-side,#000_78%,transparent)]"
              />
              <Sparkle className="animate-twinkle absolute top-[22%] left-[12%] h-4 w-4 text-ivory" />
              <Sparkle className="animate-twinkle absolute top-[14%] right-[16%] h-3 w-3 text-ivory [animation-delay:1.1s]" />
              <Sparkle className="animate-twinkle absolute right-[8%] bottom-[30%] h-5 w-5 text-ivory/70 [animation-delay:2s]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-line bg-coal py-5" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="font-display flex items-center gap-10 text-xl tracking-[0.18em] uppercase sm:text-2xl">
              {t} <Sparkle className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Shop by sport ────────────────────────────────────── */}
      <section className="container-x mt-24">
        <Reveal className="mb-10 flex flex-col items-center text-center">
          <p className="eyebrow">Choose your game</p>
          <h2 className="font-display mt-3 text-3xl font-bold sm:text-5xl">Shop by sport</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { label: "Football", slug: "football", img: "/products/barcelona-home-front.jpg", copy: "Home, away and third kits." },
            { label: "Basketball", slug: "basketball", img: "/products/knicks-brunson-11-front.jpg", copy: "Court-ready and city editions." },
          ].map((s, i) => (
            <Reveal key={s.slug} delay={i * 120}>
              <Link
                href={`/shop?sport=${s.slug}`}
                className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-3xl border border-line bg-panel p-7 sm:p-10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="relative">
                  <p className="eyebrow text-bone">{s.copy}</p>
                  <h3 className="font-display mt-2 text-4xl font-bold sm:text-5xl">{s.label}</h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] uppercase">
                    Shop {s.label}
                    <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────── */}
      <section className="container-x mt-28">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Hand-picked</p>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-5xl">From the vault</h2>
          </div>
          <Link href="/shop" className="btn btn-ghost btn-sm">
            View all
          </Link>
        </Reveal>
        {featured.length === 0 ? (
          <p className="card p-10 text-center text-mute">No products yet. Add some from the admin area.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 4) * 90}>
                <ProductCard product={p} currency={currency} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {/* ── Collections ──────────────────────────────────────── */}
      <section className="container-x mt-28">
        <Reveal className="divider-star mb-12">
          <Sparkle className="h-4 w-4" />
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <Link
                href={`/shop?collection=${c.name}`}
                className="group flex h-full min-h-56 flex-col justify-between bg-coal p-8 transition-colors duration-500 hover:bg-ivory hover:text-ink"
              >
                <span className="eyebrow transition-colors group-hover:text-ink/60">Collection 0{i + 1}</span>
                <div>
                  <h3 className="font-display text-4xl font-bold">{c.name}</h3>
                  <p className="mt-2 text-sm text-mute transition-colors group-hover:text-ink/70">{c.line}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Promise ──────────────────────────────────────────── */}
      <section className="container-x mt-28 grid gap-10 text-center md:grid-cols-3">
        {[
          { t: "Secure checkout", d: "Pay safely with Stripe. Card details never touch our servers." },
          { t: "Tracked shipping", d: free > 0 ? `Free tracked shipping on orders over ${formatMoney(free, currency)}.` : "Every order ships with tracking." },
          { t: "Your size, your fit", d: "Sizes XS to 3XL. Pick yours on every product page." },
        ].map((x, i) => (
          <Reveal key={x.t} delay={i * 100}>
            <Sparkle className="mx-auto h-5 w-5" />
            <h3 className="font-display mt-4 text-xl font-semibold">{x.t}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-mute">{x.d}</p>
          </Reveal>
        ))}
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container-x mt-28">
        <Reveal className="grain relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-raise to-ink px-6 py-20 text-center">
          <Crown className="mx-auto h-10 w-16" />
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold sm:text-5xl">Wear the crown.</h2>
          <p className="mx-auto mt-4 max-w-md text-mute">New kits land in the vault regularly. Find yours before it&rsquo;s gone.</p>
          <Link href="/shop" className="btn btn-primary mt-8">
            Start shopping
          </Link>
        </Reveal>
      </section>
    </>
  );
}
