"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { storeConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { parsePriceInput } from "@/lib/money";
import { deleteImage, MAX_IMAGES_PER_PRODUCT, saveImage, UploadError } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { productSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type ProductFormState = { error?: string; fieldErrors?: FieldErrors };

function readForm(formData: FormData) {
  const priceRaw = String(formData.get("price") ?? "");
  const price = parsePriceInput(priceRaw, storeConfig.currency);
  return productSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    collection: String(formData.get("collection") ?? ""),
    sport: String(formData.get("sport") ?? ""),
    price: price ?? Number.NaN,
    description: String(formData.get("description") ?? ""),
    sizes: formData.getAll("sizes").map(String),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });
}

function newFiles(formData: FormData) {
  return formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "jersey";
  let slug = base;
  for (let i = 2; ; i++) {
    const clash = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}

async function storeFiles(files: File[]) {
  const saved: string[] = [];
  try {
    for (const f of files) saved.push(await saveImage(f));
    return saved;
  } catch (err) {
    await Promise.all(saved.map(deleteImage)); // don't leave orphans behind
    throw err;
  }
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = readForm(formData);
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const files = newFiles(formData);
  if (files.length === 0) return { error: "Add at least one product photo.", fieldErrors: { images: "Add at least one photo" } };
  if (files.length > MAX_IMAGES_PER_PRODUCT) return { error: `You can upload up to ${MAX_IMAGES_PER_PRODUCT} photos.` };

  let urls: string[];
  try {
    urls = await storeFiles(files);
  } catch (err) {
    return { error: err instanceof UploadError ? err.message : "Photo upload failed. Please try again.", fieldErrors: { images: "Upload failed" } };
  }

  const { sizes, ...data } = parsed.data;
  const product = await db.product.create({
    data: {
      ...data,
      sizes: JSON.stringify(sizes),
      slug: await uniqueSlug(data.name),
      images: { create: urls.map((url, i) => ({ url, alt: `${data.name} photo ${i + 1}`, sortOrder: i })) },
    },
  });
  redirect(`/admin/products?saved=${encodeURIComponent(product.name)}`);
}

export async function updateProduct(id: string, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const existing = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!existing) return { error: "This product no longer exists." };

  const parsed = readForm(formData);
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };

  const remove = new Set(formData.getAll("removeImage").map(String));
  const cover = String(formData.get("coverImage") ?? "");
  const kept = existing.images.filter((img) => !remove.has(img.id));
  const files = newFiles(formData);

  if (kept.length + files.length === 0) return { error: "A product needs at least one photo.", fieldErrors: { images: "Keep or add at least one photo" } };
  if (kept.length + files.length > MAX_IMAGES_PER_PRODUCT) return { error: `A product can have up to ${MAX_IMAGES_PER_PRODUCT} photos.` };

  let urls: string[];
  try {
    urls = await storeFiles(files);
  } catch (err) {
    return { error: err instanceof UploadError ? err.message : "Photo upload failed. Please try again.", fieldErrors: { images: "Upload failed" } };
  }

  // cover photo first, then the rest in their current order
  const ordered = [...kept].sort((a, b) => (a.id === cover ? -1 : b.id === cover ? 1 : 0));
  const removed = existing.images.filter((img) => remove.has(img.id));
  const { sizes, ...data } = parsed.data;

  await db.$transaction([
    db.productImage.deleteMany({ where: { id: { in: removed.map((r) => r.id) } } }),
    ...ordered.map((img, i) => db.productImage.update({ where: { id: img.id }, data: { sortOrder: i } })),
    db.product.update({
      where: { id },
      data: {
        ...data,
        sizes: JSON.stringify(sizes),
        images: {
          create: urls.map((url, i) => ({ url, alt: `${data.name} photo ${ordered.length + i + 1}`, sortOrder: ordered.length + i })),
        },
      },
    }),
  ]);
  await Promise.all(removed.map((r) => deleteImage(r.url)));
  redirect(`/admin/products?saved=${encodeURIComponent(data.name)}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) redirect("/admin/products");
  // Past orders keep their own copy of the name, size and price.
  await db.product.delete({ where: { id } });
  await Promise.all(product.images.map((img) => deleteImage(img.url)));
  redirect(`/admin/products?deleted=${encodeURIComponent(product.name)}`);
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({ where: { id }, select: { active: true } });
  if (product) await db.product.update({ where: { id }, data: { active: !product.active } });
  redirect("/admin/products");
}
