import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCollections } from "@/lib/catalog";
import { storeConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { priceToInput } from "@/lib/money";
import { parseSizes } from "@/lib/utils";
import { updateProduct } from "../actions";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    getCollections(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/admin/products" className="text-xs tracking-[0.16em] text-mute uppercase hover:text-ivory">← Products</Link>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Edit product</h1>
        </div>
        {product.active && <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm">View in store ↗</Link>}
      </header>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        currency={storeConfig.currency}
        submitLabel="Save changes"
        collections={collections}
        initial={{
          name: product.name,
          collection: product.collection,
          sport: product.sport,
          price: priceToInput(product.price, storeConfig.currency),
          description: product.description,
          sizes: parseSizes(product.sizes),
          featured: product.featured,
          active: product.active,
          images: product.images.map((i) => ({ id: i.id, url: i.url })),
        }}
      />
    </div>
  );
}
