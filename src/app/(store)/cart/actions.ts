"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { parseSizes } from "@/lib/utils";

const input = z.array(z.object({ productId: z.string().max(50), size: z.string().max(5) })).max(50);

/**
 * Returns up-to-date product info for the items in a cart so the cart page
 * can show current prices and flag anything no longer available.
 */
export async function refreshCart(lines: { productId: string; size: string }[]) {
  const parsed = input.safeParse(lines);
  if (!parsed.success) return [];
  const ids = [...new Set(parsed.data.map((l) => l.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  return parsed.data.map((l) => {
    const p = products.find((x) => x.id === l.productId);
    if (!p || !p.active) return { productId: l.productId, size: l.size, available: false as const };
    return {
      productId: l.productId,
      size: l.size,
      available: parseSizes(p.sizes).includes(l.size),
      product: {
        slug: p.slug,
        name: p.name,
        collection: p.collection,
        sport: p.sport,
        price: p.price,
        image: p.images[0]?.url ?? null,
      },
    };
  });
}
