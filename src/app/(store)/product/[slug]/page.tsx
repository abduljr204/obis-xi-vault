import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/AddToCart";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { Sparkle } from "@/components/ui/Brand";
import { Reveal } from "@/components/ui/Reveal";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { storeConfig } from "@/lib/config";
import { SPORTS, sportLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelated(product);
  const currency = storeConfig.currency;
  const sportSlug = SPORTS.find((s) => s.value === product.sport)?.slug;

  return (
    <div className="container-x pt-8 sm:pt-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs tracking-[0.16em] text-mute uppercase">
        <Link href="/shop" className="hover:text-ivory">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?sport=${sportSlug}`} className="hover:text-ivory">{sportLabel(product.sport)}</Link>
        <span className="mx-2">/</span>
        <span className="text-bone">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="animate-fade-up">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="animate-fade-up lg:sticky lg:top-28 lg:self-start" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/shop?collection=${encodeURIComponent(product.collection)}`}
              className="rounded-full border border-ivory/30 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.2em] uppercase hover:border-ivory"
            >
              {product.collection}
            </Link>
            <span className="eyebrow">{sportLabel(product.sport)}</span>
          </div>
          <h1 className="font-display mt-4 text-3xl leading-tight font-bold sm:text-5xl">{product.name}</h1>
          <p className="font-display mt-4 text-2xl">{formatMoney(product.price, currency)}</p>

          <div className="divider-star my-8"><Sparkle className="h-3 w-3" /></div>

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              collection: product.collection,
              sport: product.sport,
              price: product.price,
              image: product.images[0]?.url ?? null,
            }}
            sizes={product.sizeList}
          />

          <div className="mt-10 space-y-6 border-t border-line pt-8">
            <div>
              <h2 className="field-label">Description</h2>
              <p className="leading-relaxed whitespace-pre-line text-mute">{product.description}</p>
            </div>
            <div>
              <h2 className="field-label">Available sizes</h2>
              <p className="text-mute">{product.sizeList.join(" · ") || "Currently sold out"}</p>
            </div>
            <ul className="grid gap-3 text-sm text-mute sm:grid-cols-2">
              <li className="flex items-center gap-2"><Sparkle className="h-3 w-3 text-ivory" /> Secure Stripe checkout</li>
              <li className="flex items-center gap-2"><Sparkle className="h-3 w-3 text-ivory" /> Tracked shipping</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <Reveal>
            <p className="eyebrow">You may also like</p>
            <h2 className="font-display mt-3 mb-10 text-3xl font-bold sm:text-4xl">More from the vault</h2>
          </Reveal>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 80}>
                <ProductCard product={p} currency={currency} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
