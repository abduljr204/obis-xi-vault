import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCollections } from "@/lib/catalog";
import { storeConfig } from "@/lib/config";
import { createProduct } from "../actions";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const collections = await getCollections();
  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/products" className="text-xs tracking-[0.16em] text-mute uppercase hover:text-ivory">← Products</Link>
        <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Add product</h1>
      </header>
      <ProductForm action={createProduct} currency={storeConfig.currency} submitLabel="Create product" collections={collections} />
    </div>
  );
}
