import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FlashToast } from "@/components/ui/Toast";
import { storeConfig } from "@/lib/config";
import { sportLabel } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { parseSizes } from "@/lib/utils";
import { deleteProduct, toggleProductActive } from "./actions";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 60);
  const products = await db.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { collection: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, _count: { select: { orderItems: true } } },
  });

  return (
    <div className="space-y-8">
      <FlashToast message={sp.saved ? `Saved “${sp.saved}”` : sp.deleted ? `Deleted “${sp.deleted}”` : null} />
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Products</h1>
        </div>
        <div className="flex gap-3">
          <form className="flex-1 sm:w-64">
            <input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products" className="input !min-h-10 !rounded-full !py-2 text-sm" />
          </form>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ Add product</Link>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="font-display text-xl">{q ? "No products match your search." : "No products yet."}</p>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm mt-6">Add your first product</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-faint">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Collection</th>
                <th className="px-5 py-3 font-medium">Sport</th>
                <th className="px-5 py-3 font-medium">Sizes</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-raise/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-panel">
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                        {p.featured && <p className="text-xs text-gold">★ Featured</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.collection}</td>
                  <td className="px-5 py-3">{sportLabel(p.sport)}</td>
                  <td className="px-5 py-3 text-xs text-mute">{parseSizes(p.sizes).join(", ")}</td>
                  <td className="px-5 py-3">{formatMoney(p.price, storeConfig.currency)}</td>
                  <td className="px-5 py-3">
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className={`whitespace-nowrap hover:underline ${p.active ? "text-ok" : "text-faint"}`} title="Click to show or hide in the store">
                        {p.active ? "● Live" : "○ Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {p.active && <Link href={`/product/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">View</Link>}
                      <Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton
                          className="btn btn-danger btn-sm"
                          message={`Delete “${p.name}”? This can't be undone.${p._count.orderItems ? ` It appears in ${p._count.orderItems} past order line(s) — those orders keep their details. Consider hiding it instead.` : ""}`}
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
