// Seeds the database with the starter jersey catalogue (and optionally the first admin).
// Run with:  npm run db:seed
//
// Product photos live in public/products/ as <photo>-front.jpg and <photo>-back.jpg.
// Re-running the seed refreshes these products; products you add in the admin area are left alone.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  /** Base file name in public/products/ (front and back photos) */
  photo: string;
};

const FB = ["S", "M", "L", "XL", "XXL"];
const BB = ["S", "M", "L", "XL", "XXL", "3XL"];

const products: Seed[] = [
  // ───────────── Football ─────────────
  {
    slug: "west-germany-1990-away-jersey",
    name: "West Germany 1990 Away Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    description:
      "The green away shirt from the summer West Germany won the World Cup. Bold green and white geometric print, fold-over collar and three-stripe shoulders.",
    photo: "germany-1990-away",
  },
  {
    slug: "manchester-united-home-jersey",
    name: "Manchester United Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    description: "United red with a black and white collar and cuffs, white three-stripe shoulders and a tonal pattern woven into the fabric.",
    photo: "man-united-home",
  },
  {
    slug: "liverpool-home-jersey",
    name: "Liverpool Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    description: "Deep Liverpool red with white three-stripe shoulders, white cuffs and fine white piping down the sides. The Liver bird sits over the heart.",
    photo: "liverpool-home",
  },
  {
    slug: "club-america-home-jersey",
    name: "Club América Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8499,
    sizes: FB,
    description: "Las Águilas in their famous yellow, finished with a navy and red ribbed collar and cuffs and the club crest on the chest.",
    photo: "club-america-home",
  },
  {
    slug: "chivas-guadalajara-home-jersey",
    name: "Chivas Guadalajara Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8499,
    sizes: FB,
    description: "The red and white stripes of El Rebaño Sagrado with navy shoulder panels, navy cuffs and the Chivas crest.",
    photo: "chivas-home",
  },
  {
    slug: "real-madrid-home-jersey",
    name: "Real Madrid Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    description: "Classic Los Blancos white with black three-stripe shoulders and a subtle tonal pattern across the body. Name and number printing on request.",
    photo: "real-madrid-home",
  },
  {
    slug: "fc-barcelona-home-jersey",
    name: "FC Barcelona Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    description: "Bold blaugrana stripes with garnet cuffs, the club crest and the Catalan senyera on the back of the neck.",
    photo: "barcelona-home",
  },
  {
    slug: "arsenal-2002-04-home-henry-14",
    name: "Arsenal 2002–04 Home – Henry 14",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    description:
      "Red body, white sleeves and gold piping, with Henry 14 on the back. The home shirt Arsenal wore through the unbeaten Invincibles season.",
    photo: "arsenal-henry-14",
  },
  {
    slug: "netherlands-1988-home-jersey",
    name: "Netherlands 1988 Home Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    featured: true,
    description:
      "The orange geometric print the Dutch wore to win Euro '88. One of the most loved football shirts ever made, with a V-neck collar and white three-stripe shoulders.",
    photo: "netherlands-1988-home",
  },
  {
    slug: "mexico-black-jersey",
    name: "Mexico Black Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    featured: true,
    description: "El Tri in black, with a tonal Aztec calendar graphic across the front and back and green and red trim on the shoulders and cuffs.",
    photo: "mexico-black",
  },
  {
    slug: "spain-home-jersey-lamine-yamal-19",
    name: "Spain Home Jersey – Lamine Yamal 19",
    collection: "New",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description: "La Roja's red home shirt with yellow shoulder stripes and navy side panels, with Lamine Yamal 19 printed front and back.",
    photo: "spain-home-yamal-19",
  },
  {
    slug: "manchester-city-home-jersey-haaland-9",
    name: "Manchester City Home Jersey – Haaland 9",
    collection: "New",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description: "Sky-blue City home shirt with navy and white striped collar and cuffs, and Haaland 9 on the back.",
    photo: "man-city-home-haaland-9",
  },
  {
    slug: "manchester-united-2007-08-home-long-sleeve-ronaldo-7",
    name: "Manchester United 2007/08 Home Long Sleeve – Ronaldo 7",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description:
      "Long-sleeved red home shirt from the 2007/08 double-winning season, with Ronaldo 7 on the back and the white stripe running down the spine.",
    photo: "man-united-2007-08-ls-ronaldo-7",
  },
  {
    slug: "real-madrid-2016-17-away-ronaldo-7",
    name: "Real Madrid 2016/17 Away – Ronaldo 7",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description:
      "The purple away shirt from the season Real Madrid won La Liga and the Champions League, with white trim, Champions League sleeve patches and Ronaldo 7 on the back.",
    photo: "real-madrid-2016-17-away-ronaldo-7",
  },
  {
    slug: "arsenal-1991-93-away-jersey",
    name: "Arsenal 1991–93 Away Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    featured: true,
    description:
      "The famous \"bruised banana\". Yellow with a navy zig-zag print, navy collar and cuffs with red trim, and three-stripe shoulders. A true 90s cult classic.",
    photo: "arsenal-1991-93-away",
  },

  // ───────────── Basketball ─────────────
  {
    slug: "new-york-knicks-icon-jersey-toppin-1",
    name: "New York Knicks Icon Jersey – Toppin 1",
    collection: "Metro",
    sport: "BASKETBALL",
    price: 9499,
    sizes: BB,
    description: "Knicks royal blue with orange and white trim, the New York wordmark across the chest and Toppin 1 on the back.",
    photo: "knicks-toppin-1",
  },
  {
    slug: "los-angeles-lakers-kobe-bryant-8-jersey",
    name: "Los Angeles Lakers Kobe Bryant 8 Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description: "Lakers gold with purple and white trim and Bryant 8 on the back, the number from Kobe's first three championships.",
    photo: "lakers-bryant-8",
  },
  {
    slug: "chicago-bulls-jordan-23-red-jersey",
    name: "Chicago Bulls Jordan 23 Red Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description: "The road red of the 90s dynasty, with Jordan 23 in black and white. The most famous number in basketball.",
    photo: "bulls-jordan-23",
  },
];

async function main() {
  for (const p of products) {
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
        { productId: product.id, url: `/products/${p.photo}-front.jpg`, alt: `${p.name} – front`, sortOrder: 0 },
        { productId: product.id, url: `/products/${p.photo}-back.jpg`, alt: `${p.name} – back`, sortOrder: 1 },
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
