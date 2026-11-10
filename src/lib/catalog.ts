import "server-only";
import type { Prisma } from "@prisma/client";
import { ALL_SIZES, sportFromSlug } from "./constants";
import { db } from "./db";
import { parseSizes } from "./utils";

export type CatalogFilters = {
  sport?: string;
  collection?: string;
  size?: string;
  q?: string;
  sort?: string;
};

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

const imageSelect = { orderBy: { sortOrder: "asc" as const }, select: { url: true, alt: true } };

export async function getCatalog(filters: CatalogFilters) {
  const where: Prisma.ProductWhereInput = { active: true };
  const sport = sportFromSlug(filters.sport);
  if (sport) where.sport = sport;
  if (filters.collection) where.collection = filters.collection;
  if (filters.size && (ALL_SIZES as readonly string[]).includes(filters.size)) {
    where.sizes = { contains: `"${filters.size}"` };
  }
  const q = filters.q?.trim().slice(0, 60);
  if (q) {
    const match = { contains: q, mode: "insensitive" as const };
    where.OR = [{ name: match }, { description: match }, { collection: match }];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "price-asc"
      ? [{ price: "asc" }]
      : filters.sort === "price-desc"
        ? [{ price: "desc" }]
        : filters.sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ featured: "desc" }, { createdAt: "desc" }];

  return db.product.findMany({ where, orderBy, include: { images: imageSelect } });
}

export async function getCollections() {
  const rows = await db.product.findMany({ where: { active: true }, distinct: ["collection"], select: { collection: true } });
  return rows.map((r) => r.collection).sort();
}

export async function getFeatured(limit = 8) {
  return db.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: imageSelect },
  });
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    where: { slug, active: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  return product ? { ...product, sizeList: parseSizes(product.sizes) } : null;
}

export async function getRelated(product: { id: string; sport: string; collection: string }, limit = 4) {
  const rows = await db.product.findMany({
    where: { active: true, id: { not: product.id }, OR: [{ collection: product.collection }, { sport: product.sport }] },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: imageSelect },
  });
  return rows;
}
