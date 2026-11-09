// Seeds the database with the starter jersey catalogue (and optionally the first admin).
// Run with:  npm run db:seed
//
// Product photos live in public/products/ as <name>-front.jpg and <name>-back.jpg.
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
  /** File names in public/products/, first one is the main photo */
  images: string[];
};

const FB = ["S", "M", "L", "XL", "XXL"];
const BB = ["S", "M", "L", "XL", "XXL", "3XL"];

/** Front photo first, back photo second (shown when hovering a product card). */
const photos = (name: string) => [`${name}-front.jpg`, `${name}-back.jpg`];

const products: Seed[] = [
  // ───────────── Football ─────────────
  {
    slug: "fc-barcelona-home-jersey",
    name: "FC Barcelona Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description:
      "Blaugrana stripes in garnet and royal blue with a navy crew collar and cuffs, gold sponsor and swoosh, and the club crest on the chest. The Barça Foundation badge sits low on the back.",
    images: photos("barcelona-home"),
  },
  {
    slug: "real-madrid-home-jersey",
    name: "Real Madrid Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description:
      "Clean white Los Blancos home shirt with a dark green patterned collar and cuffs, a raspberry shoulder stripe and the gold club crest.",
    images: photos("real-madrid-home"),
  },
  {
    slug: "manchester-city-home-haaland-9",
    name: "Manchester City Home – Haaland 9",
    collection: "New",
    sport: "FOOTBALL",
    price: 10999,
    sizes: FB,
    featured: true,
    description:
      "Sky-blue home shirt that fades to white at the hem, with pale blue trim, a tonal club crest and Haaland 9 printed on the back.",
    images: photos("man-city-haaland-9"),
  },
  {
    slug: "manchester-united-2007-08-home-ronaldo-7-long-sleeve",
    name: "Manchester United 2007/08 Home – Ronaldo 7 (Long Sleeve)",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 11999,
    sizes: FB,
    featured: true,
    description:
      "Long-sleeved red home shirt from the 2007/08 season, with Ronaldo 7 on the back, Premier League champions sleeve badges and the white MUFC stripe down the spine.",
    images: photos("man-united-2007-ronaldo-7"),
  },
  {
    slug: "argentina-2022-home-messi-10",
    name: "Argentina 2022 Home – Messi 10",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 10999,
    sizes: FB,
    featured: true,
    description:
      "Sky-blue and white stripes with the FIFA World Champions 2022 badge and three stars above the AFA crest. Messi 10 on the front and back.",
    images: photos("argentina-2022-messi-10"),
  },
  {
    slug: "spain-home-lamine-yamal-19",
    name: "Spain Home – Lamine Yamal 19",
    collection: "New",
    sport: "FOOTBALL",
    price: 10999,
    sizes: FB,
    featured: true,
    description:
      "Red body with fine gold pinstripes, navy raglan sleeves and a gold crest, with Lamine Yamal 19 in gold on the back and 19 on the front.",
    images: photos("spain-yamal-19"),
  },
  {
    slug: "mexico-black-jersey",
    name: "Mexico Black Jersey",
    collection: "Limited",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    description:
      "All-black shirt with a tonal pattern woven through the body, green trim on the collar and cuffs, and a white, green and red crest.",
    images: photos("mexico-black"),
  },
  {
    slug: "chivas-guadalajara-home-jersey",
    name: "Chivas Guadalajara Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    description:
      "The rojiblanco stripes of Guadalajara: red and white vertical stripes with a navy polo collar, button placket and navy side panels.",
    images: photos("chivas-home"),
  },
  {
    slug: "club-america-home-jersey",
    name: "Club América Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    description:
      "Canary-yellow home shirt with navy collar and cuffs, a tonal crest pattern across the front and the CA crest on the chest.",
    images: photos("club-america-home"),
  },

  // ───────────── Basketball ─────────────
  {
    slug: "new-york-knicks-brunson-11-jersey",
    name: "New York Knicks Jalen Brunson 11 Icon Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description:
      "Knicks royal blue with orange and white trim, the arched New York wordmark on the front and Brunson 11 on the back.",
    images: photos("knicks-brunson-11"),
  },
  {
    slug: "new-york-knicks-brunson-11-city-edition-jersey",
    name: "New York Knicks Jalen Brunson 11 City Edition Jersey",
    collection: "Metro",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    description:
      "Blue pinstripes with orange trim and black side panels, a layered New York wordmark, an NYC patch on the chest and Brunson 11 on the back.",
    images: photos("knicks-brunson-11-city"),
  },
  {
    slug: "golden-state-warriors-curry-30-statement-jersey",
    name: "Golden State Warriors Stephen Curry 30 Statement Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description:
      "Navy Statement Edition with gold trim and side stripes, a notched collar, the arched Golden State wordmark and Curry 30 on the back.",
    images: photos("warriors-curry-30"),
  },
  {
    slug: "los-angeles-lakers-kobe-bryant-black-mamba-jersey",
    name: "Los Angeles Lakers Kobe Bryant Black Mamba Jersey",
    collection: "Metro",
    sport: "BASKETBALL",
    price: 11499,
    sizes: BB,
    featured: true,
    description:
      "Black snakeskin-pattern body with gold and purple trim, the Lakers script in gold outline, 8 on the front and Bryant 24 on the back.",
    images: photos("lakers-bryant-mamba"),
  },
  {
    slug: "miami-heat-wade-3-vice-city-edition-jersey",
    name: "Miami Heat Dwyane Wade 3 Vice City Edition Jersey",
    collection: "Metro",
    sport: "BASKETBALL",
    price: 10499,
    sizes: BB,
    description:
      "The black Miami Vice look: neon pink and sky-blue trim, the Miami script across the chest and Wade 3 in pink on the back.",
    images: photos("heat-wade-3-vice"),
  },
  {
    slug: "chicago-bulls-1997-98-jordan-23-jersey",
    name: "Chicago Bulls 1997/98 Michael Jordan 23 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 11999,
    sizes: BB,
    featured: true,
    description:
      "Road red from the 1997/98 season with the NBA Finals patch, the arched Bulls wordmark and Jordan 23 in black and white.",
    images: photos("bulls-jordan-23-1998"),
  },
  {
    slug: "philadelphia-76ers-2000-01-iverson-3-jersey",
    name: "Philadelphia 76ers 2000/01 Allen Iverson 3 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description:
      "Black alternate from the 2000/01 season with red and gold trim, a star on the V-neck, the Sixers shooting-star wordmark and Iverson 3 on the back.",
    images: photos("sixers-iverson-3"),
  },
  {
    slug: "toronto-raptors-1998-99-carter-15-jersey",
    name: "Toronto Raptors 1998/99 Vince Carter 15 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 10499,
    sizes: BB,
    description:
      "White home jersey from Carter's rookie season, with jagged pinstripes, the red dinosaur logo, purple trim and Carter 15 on the back.",
    images: photos("raptors-carter-15"),
  },
  {
    slug: "orlando-magic-1994-95-hardaway-1-jersey",
    name: "Orlando Magic 1994/95 Penny Hardaway 1 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 10499,
    sizes: BB,
    description:
      "Royal blue with white pinstripes and black-and-white trim, the Orlando star wordmark and Hardaway 1 on the back.",
    images: photos("magic-hardaway-1"),
  },
  {
    slug: "phoenix-suns-barkley-34-purple-jersey",
    name: "Phoenix Suns Charles Barkley 34 Purple Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 10499,
    sizes: BB,
    description:
      "90s Suns road purple with orange and black trim, the sunburst-and-streaks design across the front and Barkley 34 on the back.",
    images: photos("suns-barkley-34"),
  },
  {
    slug: "paris-basketball-jersey",
    name: "Paris Basketball Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    description:
      "Black jersey with blurred red and blue stripes rising from the hem, a striped V-neck, white side bars and the Paris wordmark. Plain back with a small club emblem.",
    images: photos("paris-basketball"),
  },
];

// Products from earlier versions of this seed. They are hidden (not deleted, so past orders keep
// their link) and their bundled photos are removed because those files no longer exist.
const RETIRED_SLUGS = [
  // illustrated sample jerseys
  "vault-metro-home-jersey",
  "vault-metro-away-jersey",
  "classic-98-stripes-jersey",
  "classic-emerald-hoops-jersey",
  "royal-halves-jersey",
  "crown-chevron-third-jersey",
  "retro-sky-jersey",
  "vault-metro-hardwood-jersey",
  "classic-96-pinstripe-jersey",
  "night-court-jersey",
  "golden-era-jersey",
  "skyline-city-jersey",
  // first photo catalogue
  "fc-barcelona-2010-11-home-jersey",
  "fc-barcelona-2005-06-home-ronaldinho-10",
  "real-madrid-2006-07-home-beckham-23",
  "manchester-united-1990-92-home-jersey",
  "sporting-cp-2002-03-home-ronaldo-28",
  "river-plate-2026-27-home-jersey",
  "brazil-2016-home-jersey",
  "germany-1998-world-cup-home-jersey",
  "celtic-1977-hoops-jersey",
  "boca-juniors-1907-retro-jersey",
  "chicago-bulls-jordan-23-red-jersey",
  "los-angeles-lakers-kobe-bryant-8-jersey",
  "los-angeles-lakers-lebron-23-icon-jersey",
  "atlanta-hawks-steve-smith-8-jersey",
  "indiana-pacers-tinsley-11-pinstripe-jersey",
  "denver-nuggets-rainbow-issel-44-jersey",
  "los-angeles-clippers-norman-3-jersey",
  "san-antonio-spurs-anderson-40-jersey",
  "georgetown-hoyas-ewing-33-jersey",
  "uconn-huskies-hamilton-32-jersey",
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
      data: p.images.map((file, i) => ({
        productId: product.id,
        url: `/products/${file}`,
        alt: i === 0 ? p.name : `${p.name} – back`,
        sortOrder: i,
      })),
    });
  }
  console.log(`✓ Seeded ${products.length} products`);

  const retired = await db.product.updateMany({ where: { slug: { in: RETIRED_SLUGS } }, data: { active: false, featured: false } });
  await db.productImage.deleteMany({ where: { product: { slug: { in: RETIRED_SLUGS } }, url: { startsWith: "/products/" } } });
  if (retired.count) console.log(`✓ Hid ${retired.count} old sample products`);

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
