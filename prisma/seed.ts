// Seeds the database with demo jerseys (and optionally the first admin).
// Run with:  npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { jerseyBack, jerseyFront, type JerseySpec } from "./jersey-art";

const db = new PrismaClient();

type Seed = {
  slug: string;
  name: string;
  collection: string;
  sport: "FOOTBALL" | "BASKETBALL";
  price: number;
  sizes: string[];
  featured?: boolean;
  description: string;
  art: JerseySpec;
};

const FB = ["S", "M", "L", "XL", "XXL"];
const BB = ["S", "M", "L", "XL", "XXL", "3XL"];

const products: Seed[] = [
  {
    slug: "vault-metro-home-jersey",
    name: "Vault Metro Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 7999,
    sizes: FB,
    featured: true,
    description:
      "Our signature home shirt. Jet-black body with fine ivory pinstripes, a crowned crest and a clean crew collar. Lightweight, breathable knit built for match day and the streets after.",
    art: { kind: "football", base: "#0b0b0b", accent: "#e9e4d8", trim: "#e9e4d8", text: "#f4efe6", pattern: "pinstripes", number: "10", wordmark: "METRO" },
  },
  {
    slug: "vault-metro-away-jersey",
    name: "Vault Metro Away Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 7999,
    sizes: FB,
    featured: true,
    description:
      "The away counterpart: ivory base cut by a bold black sash. Moisture-wicking fabric, tailored athletic fit and a tonal crest.",
    art: { kind: "football", base: "#efeae0", accent: "#111111", trim: "#111111", text: "#111111", pattern: "sash", number: "7" },
  },
  {
    slug: "classic-98-stripes-jersey",
    name: "Classic '98 Stripes Jersey",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 6999,
    sizes: FB,
    featured: true,
    description:
      "A love letter to late-90s terraces. Crimson and white vertical stripes, contrast black collar and a relaxed vintage fit.",
    art: { kind: "football", base: "#f2f0ea", accent: "#c8102e", trim: "#111111", text: "#111111", pattern: "stripes", number: "9" },
  },
  {
    slug: "classic-emerald-hoops-jersey",
    name: "Classic Emerald Hoops Jersey",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 6999,
    sizes: FB,
    description: "Emerald and white hoops, a timeless look. Soft-touch fabric with ribbed collar and cuffs.",
    art: { kind: "football", base: "#f4f2ec", accent: "#0b7a3e", trim: "#0b7a3e", text: "#0b3d22", pattern: "hoops", number: "8" },
  },
  {
    slug: "royal-halves-jersey",
    name: "Royal Halves Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 8499,
    sizes: FB,
    featured: true,
    description: "Split down the middle in navy and gold. A statement shirt from the newest drop with gold crown detailing.",
    art: { kind: "football", base: "#0f1f4a", accent: "#c9a447", trim: "#c9a447", text: "#f6efdc", pattern: "halves", number: "11" },
  },
  {
    slug: "crown-chevron-third-jersey",
    name: "Crown Chevron Third Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 8499,
    sizes: FB,
    description: "Deep violet third kit with an ivory chevron across the chest, inspired by the crown in our crest.",
    art: { kind: "football", base: "#3a1d5c", accent: "#efe6d2", trim: "#efe6d2", text: "#f7f1e3", pattern: "chevron", number: "4" },
  },
  {
    slug: "retro-sky-jersey",
    name: "Retro Sky Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 6499,
    sizes: ["S", "M", "L", "XL"],
    description: "Sky blue with a navy collar: a clean throwback silhouette with a boxy retro cut.",
    art: { kind: "football", base: "#78b7e6", accent: "#78b7e6", trim: "#14234a", text: "#14234a", pattern: "solid", number: "5", wordmark: "XI" },
  },
  {
    slug: "vault-metro-hardwood-jersey",
    name: "Vault Metro Hardwood Jersey",
    collection: "Metro",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    featured: true,
    description: "Built for the court. Black mesh body, gold trim and a bold METRO wordmark. Breathable, with stitched-feel numbers.",
    art: { kind: "basketball", base: "#0d0d0d", accent: "#0d0d0d", trim: "#c9a447", text: "#f4efe6", pattern: "solid", number: "23", wordmark: "METRO" },
  },
  {
    slug: "classic-96-pinstripe-jersey",
    name: "Classic '96 Pinstripe Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 7999,
    sizes: BB,
    featured: true,
    description: "Mid-90s pinstripes on a crisp white body with navy trim. The jersey your favourite poster was wearing.",
    art: { kind: "basketball", base: "#f6f4ee", accent: "#1d2b5c", trim: "#1d2b5c", text: "#1d2b5c", pattern: "pinstripes", number: "33", wordmark: "VAULT" },
  },
  {
    slug: "night-court-jersey",
    name: "Night Court Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    description: "Deep crimson with black side panels and ivory numbers. Lightweight mesh for late-night runs.",
    art: { kind: "basketball", base: "#8e0f1f", accent: "#111111", trim: "#111111", text: "#f4efe6", pattern: "panels", number: "1", wordmark: "NIGHT" },
  },
  {
    slug: "golden-era-jersey",
    name: "Golden Era Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 7499,
    sizes: BB,
    description: "Gold body, purple trim, pure nostalgia. A retro cut with a slightly longer length.",
    art: { kind: "basketball", base: "#e2b23a", accent: "#e2b23a", trim: "#4b2a7a", text: "#4b2a7a", pattern: "solid", number: "8", wordmark: "GOLDEN" },
  },
  {
    slug: "skyline-city-jersey",
    name: "Skyline City Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    description: "Teal city edition with an orange chevron, inspired by skyline sunsets. Part of the newest drop.",
    art: { kind: "basketball", base: "#0f6f73", accent: "#f08a24", trim: "#f08a24", text: "#f7f3ea", pattern: "chevron", number: "3", wordmark: "SKYLINE" },
  },
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "products");
  mkdirSync(outDir, { recursive: true });

  for (const [i, p] of products.entries()) {
    writeFileSync(path.join(outDir, `${p.slug}-front.svg`), jerseyFront(p.art, `p${i}`));
    writeFileSync(path.join(outDir, `${p.slug}-back.svg`), jerseyBack(p.art, `p${i}`));

    const data = {
      name: p.name,
      collection: p.collection,
      sport: p.sport,
      price: p.price,
      description: p.description,
      sizes: JSON.stringify(p.sizes),
      featured: p.featured ?? false,
      active: true,
    };
    const product = await db.product.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
    await db.productImage.deleteMany({ where: { productId: product.id, url: { startsWith: "/products/" } } });
    await db.productImage.createMany({
      data: [
        { productId: product.id, url: `/products/${p.slug}-front.svg`, alt: `${p.name} front`, sortOrder: 0 },
        { productId: product.id, url: `/products/${p.slug}-back.svg`, alt: `${p.name} back`, sortOrder: 1 },
      ],
    });
  }
  console.log(`✓ Seeded ${products.length} products`);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
    const passwordHash = await bcrypt.hash(password, 12);
    await db.admin.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash } });
    console.log(`✓ Admin account ready: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
