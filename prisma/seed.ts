// Seeds the database with the starter jersey catalogue (and optionally the first admin).
// Run with:  npm run db:seed
//
// Product photos live in public/products/ and come from Wikimedia Commons under free
// licences. Credits are listed in src/lib/photo-credits.json and shown on /credits.
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

const products: Seed[] = [
  // ───────────── Football ─────────────
  {
    slug: "fc-barcelona-2010-11-home-jersey",
    name: "FC Barcelona 2010/11 Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8999,
    sizes: FB,
    featured: true,
    description:
      "The blaugrana stripes from one of the greatest club seasons ever played. Garnet and blue body, gold-trimmed collar and cuffs, and the famous front-of-shirt partnership.",
    images: ["barcelona-2010-home.jpg"],
  },
  {
    slug: "fc-barcelona-2005-06-home-ronaldinho-10",
    name: "FC Barcelona 2005/06 Home – Ronaldinho 10",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    featured: true,
    description:
      "The shirt of the Champions League-winning season, with Ronaldinho 10 printed on the back. Classic garnet and blue stripes with a V-neck collar.",
    images: ["barcelona-2005-home.jpg", "barcelona-2005-home-back.jpg"],
  },
  {
    slug: "real-madrid-2006-07-home-beckham-23",
    name: "Real Madrid 2006/07 Home – Beckham 23",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    featured: true,
    description:
      "All-white Los Blancos home shirt with Beckham 23 on the back, from the season that ended with a league title. Navy lettering and clean contrast piping.",
    images: ["real-madrid-2007-home-beckham.jpg"],
  },
  {
    slug: "manchester-united-1990-92-home-jersey",
    name: "Manchester United 1990–92 Home Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 7999,
    sizes: FB,
    description:
      "Early-90s red with white collar, three-stripe sleeves and the iconic sponsor across the chest. A favourite from the era that started a dynasty.",
    images: ["man-united-1990-home.jpg"],
  },
  {
    slug: "sporting-cp-2002-03-home-ronaldo-28",
    name: "Sporting CP 2002/03 Home – Ronaldo 28",
    collection: "Classic",
    sport: "FOOTBALL",
    price: 9499,
    sizes: FB,
    featured: true,
    description:
      "Green and white hoops with Ronaldo 28 on the back, the number he wore as a teenager in Lisbon before leaving for Manchester.",
    images: ["sporting-ronaldo-28.jpg"],
  },
  {
    slug: "river-plate-2026-27-home-jersey",
    name: "River Plate 2026/27 Home Jersey",
    collection: "New",
    sport: "FOOTBALL",
    price: 9999,
    sizes: FB,
    featured: true,
    description: "The newest Millonarios home shirt: white body with the famous red sash, three-stripe shoulders and a crew collar.",
    images: ["river-plate-home.jpg"],
  },
  {
    slug: "brazil-2016-home-jersey",
    name: "Brazil 2016 Home Jersey",
    collection: "Metro",
    sport: "FOOTBALL",
    price: 8499,
    sizes: FB,
    description: "The canary-yellow Seleção shirt with green trim and the CBF crest. Lightweight, breathable and made for hot match days.",
    images: ["brazil-2016-home.jpg"],
  },
  {
    slug: "germany-1998-world-cup-home-jersey",
    name: "Germany 1998 World Cup Home Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 7499,
    sizes: FB,
    description: "White home shirt from France '98 with the black, red and gold chest band and three stars above the crest.",
    images: ["germany-1998-home.jpg"],
  },
  {
    slug: "celtic-1977-hoops-jersey",
    name: "Celtic 1977 Hoops Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 6999,
    sizes: FB,
    description: "Long-sleeved green and white hoops with a white polo collar, the look of the 1977 Scottish Cup final.",
    images: ["celtic-1977-hoops.jpg"],
  },
  {
    slug: "boca-juniors-1907-retro-jersey",
    name: "Boca Juniors 1907 Retro Jersey",
    collection: "Retro",
    sport: "FOOTBALL",
    price: 6999,
    sizes: ["S", "M", "L", "XL"],
    description: "A tribute to Boca's early days: sky-blue body with a yellow diagonal sash and a lace-up collar.",
    images: ["boca-1907-retro.jpg"],
  },

  // ───────────── Basketball ─────────────
  {
    slug: "chicago-bulls-jordan-23-red-jersey",
    name: "Chicago Bulls Jordan 23 Red Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description: "The road red of the 90s dynasty with Jordan 23 in white and black. The most famous number in basketball.",
    images: ["bulls-jordan-23.jpg", "bulls-jordan-23-pair.jpg"],
  },
  {
    slug: "los-angeles-lakers-kobe-bryant-8-jersey",
    name: "Los Angeles Lakers Kobe Bryant 8 Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 10999,
    sizes: BB,
    featured: true,
    description: "Forum purple with gold and white trim and Bryant 8 on the back, the number from Kobe's first three titles.",
    images: ["lakers-kobe-8.jpg"],
  },
  {
    slug: "los-angeles-lakers-lebron-23-icon-jersey",
    name: "Los Angeles Lakers LeBron 23 Jersey",
    collection: "New",
    sport: "BASKETBALL",
    price: 9999,
    sizes: BB,
    featured: true,
    description: "The modern white Lakers shirt with purple and gold script and number 23, as worn by LeBron James.",
    images: ["lakers-lebron-23.jpg"],
  },
  {
    slug: "atlanta-hawks-steve-smith-8-jersey",
    name: "Atlanta Hawks Steve Smith 8 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    description: "Late-90s Hawks road jersey with the red-to-black fade and the hawk holding a basketball on the chest.",
    images: ["hawks-smith-8.jpg", "hawks-smith-8-back.jpg"],
  },
  {
    slug: "indiana-pacers-tinsley-11-pinstripe-jersey",
    name: "Indiana Pacers Tinsley 11 Pinstripe Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 8999,
    sizes: BB,
    description: "Navy pinstripes with gold lettering and side panels, the Pacers look of the early 2000s.",
    images: ["pacers-tinsley-11.jpg", "pacers-tinsley-11-back.jpg"],
  },
  {
    slug: "denver-nuggets-rainbow-issel-44-jersey",
    name: "Denver Nuggets Rainbow Issel 44 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 9499,
    sizes: BB,
    description: "The beloved 80s skyline-and-rainbow design with Issel 44. One of the most loved retro jerseys in the game.",
    images: ["nuggets-issel-44.jpg"],
  },
  {
    slug: "los-angeles-clippers-norman-3-jersey",
    name: "Los Angeles Clippers Norman 3 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 7999,
    sizes: BB,
    description: "Early-90s Clippers road red with blue and white trim and Norman 3 on the back.",
    images: ["clippers-norman-3.jpg"],
  },
  {
    slug: "san-antonio-spurs-anderson-40-jersey",
    name: "San Antonio Spurs Anderson 40 Jersey",
    collection: "Retro",
    sport: "BASKETBALL",
    price: 7999,
    sizes: BB,
    description: "Classic black road Spurs jersey with the arched San Antonio wordmark and number 40.",
    images: ["spurs-anderson-40.jpg"],
  },
  {
    slug: "georgetown-hoyas-ewing-33-jersey",
    name: "Georgetown Hoyas Ewing 33 Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 8499,
    sizes: BB,
    description: "Navy and grey Georgetown jersey with number 33, as worn by Patrick Ewing during the Hoyas' 1980s run.",
    images: ["georgetown-ewing-33.jpg"],
  },
  {
    slug: "uconn-huskies-hamilton-32-jersey",
    name: "UConn Huskies Hamilton 32 Jersey",
    collection: "Classic",
    sport: "BASKETBALL",
    price: 8499,
    sizes: BB,
    description: "White UConn home jersey with navy Connecticut lettering and number 32, as worn by Rip Hamilton in the 1999 title run.",
    images: ["uconn-hamilton-32.jpg"],
  },
];

// Earlier versions of this seed created illustrated sample jerseys. Hide them if they exist.
const RETIRED_SLUGS = [
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
        alt: i === 0 ? p.name : `${p.name} – photo ${i + 1}`,
        sortOrder: i,
      })),
    });
  }
  console.log(`✓ Seeded ${products.length} products`);

  const retired = await db.product.updateMany({ where: { slug: { in: RETIRED_SLUGS } }, data: { active: false, featured: false } });
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
