import Link from "next/link";
import { sportLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export type ProductCardData = {
  slug: string;
  name: string;
  collection: string;
  sport: string;
  price: number;
  images: { url: string; alt: string }[];
};

export function ProductCard({ product, currency, priority = false }: { product: ProductCardData; currency: string; priority?: boolean }) {
  const [front, back] = product.images;
  return (
    <Link href={`/product/${product.slug}`} className="group block" aria-label={`${product.name}, ${formatMoney(product.price, currency)}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-panel">
        {front ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={front.url}
              alt={front.alt || product.name}
              loading={priority ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            {back && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={back.url}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-faint">No photo</div>
        )}
        <span className="absolute top-3 left-3 rounded-full border border-ivory/20 bg-ink/70 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] uppercase backdrop-blur">
          {product.collection}
        </span>
        <span className="absolute right-3 bottom-3 translate-y-2 rounded-full bg-ivory px-4 py-2 text-[0.6rem] font-bold tracking-[0.2em] text-ink uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="eyebrow !text-[0.6rem]">{sportLabel(product.sport)}</p>
          <h3 className="mt-1.5 line-clamp-2 text-sm font-medium sm:truncate sm:text-base text-ivory transition-colors group-hover:text-white">{product.name}</h3>
        </div>
        <p className="shrink-0 font-display text-sm font-semibold sm:text-base">{formatMoney(product.price, currency)}</p>
      </div>
    </Link>
  );
}
