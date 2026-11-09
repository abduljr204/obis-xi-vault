# Obi's XI Vault

Online store for football and basketball jerseys, styled to match the Obi's XI Vault crest: black and ivory, engraved serif type, crown and sparkle details.

**What's included**

- **Storefront:** home, catalog (filter by sport, style/collection and size, plus search and sort), product pages with a photo gallery and size picker, cart, checkout and order confirmation.
- **Request a jersey:** a form at `/request` where customers ask you to find a jersey you don't list (team, season, name & number, size, quantity, budget, reference link). Requests show up in the admin area under **Requests**, where you can track them (New → Sourcing → Quote sent → Fulfilled / Declined), reply by email and copy the details for your supplier.
- **Payments:** Stripe Checkout. Card details are entered on Stripe's own page and never reach or get stored on this server.
- **Admin area** at `/admin`, protected by a password:
  - add, edit, hide or delete products, and upload photos
  - view and filter orders, with each order's items, sizes, quantities, customer contact, address and payment status
  - move orders through **New → Sent to supplier → Shipped → Completed** (or Cancelled), with carrier, tracking number and private notes
  - a ready-to-copy **supplier summary** on every order (and an "Open in email" button if you set `SUPPLIER_EMAIL`)
- **Security:** hashed admin passwords (bcrypt), signed httpOnly session cookies, login throttling, validation in the browser and again on the server, prices always recalculated on the server, checked image uploads and security headers.
- Works on phones, tablets and desktops. Animations are subtle and switch off for visitors who choose "reduce motion".

## Technology

| Part | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Frontend and backend in one project, server-rendered pages for speed and SEO, easy to deploy |
| Database | **Prisma ORM**: SQLite locally, Postgres in production | Nothing to install for local use; switching to Postgres for production is a one-line change |
| Payments | **Stripe Checkout** | Stripe hosts the card form (PCI compliant), supports many currencies, Apple Pay and Google Pay |
| Styling | **Tailwind CSS 4** + Cinzel and Inter fonts | Matches the logo's engraved serif and wide-spaced capitals |
| Validation | **Zod** | The same rules check forms in the browser and on the server |
| Photos | Local `uploads/` folder, or **Vercel Blob** in production | No setup for local use; persistent cloud storage when deployed |

## Project layout

```
obis-xi-vault/
├─ Start Store.bat            ← double-click to run the site on Windows
├─ prisma/
│  ├─ schema.prisma           ← database tables (products, orders, admins)
│  └─ seed.ts                 ← 29 starter jerseys (14 football, 15 basketball)
├─ scripts/
│  ├─ setup.mjs               ← first-time setup
│  └─ create-admin.ts         ← create an admin or reset a password
├─ public/brand/logo.jpg      ← your logo
├─ public/products/           ← starter jersey photos (front + back for each)
├─ uploads/                   ← photos uploaded from the admin area (local mode)
└─ src/
   ├─ app/
   │  ├─ (store)/             ← customer pages: home, shop, product, cart, checkout, order
   │  ├─ admin/               ← login + dashboard, products, orders
   │  ├─ api/checkout         ← creates the order + Stripe payment session
   │  ├─ api/webhooks/stripe  ← Stripe tells us when a payment succeeds, fails or is refunded
   │  └─ media/[name]         ← serves uploaded photos
   ├─ components/
   │  ├─ store/               ← header, footer, cart, product card, checkout form…
   │  ├─ admin/               ← admin nav, product form, order form…
   │  └─ ui/                  ← brand marks (crown, sparkle), toasts, scroll reveal
   ├─ lib/                    ← database, auth, validation, orders, Stripe, storage, config
   └─ middleware.ts           ← blocks /admin for anyone not signed in
```

## Run it on your computer

You need **Node.js 20 or newer** (https://nodejs.org).

**Easiest way (Windows):** double-click **`Start Store.bat`**. The first time, it installs everything, creates the database with sample products, then opens http://localhost:3000.

**Or use a terminal:**

```bash
npm install
npm run setup        # creates .env, the database and sample products
npm run admin:create # create your admin login (asks for email + password)
npm run dev          # start the site at http://localhost:3000
```

> **About npm 11 "install scripts":** Prisma and esbuild need their install scripts. They are already approved in `package.json` (`allowScripts`), so `npm install` should work. If npm asks anyway, run `npm install-scripts approve prisma @prisma/client @prisma/engines esbuild`.

## Create the admin account

```bash
npm run admin:create
```

Enter your email and a password of at least 10 characters, then sign in at **http://localhost:3000/admin**. Run the same command again with the same email to reset a forgotten password. You can also run it non-interactively: `npm run admin:create -- you@example.com "your-strong-password"`.

## Configure payments (Stripe)

Without Stripe keys the site runs in **demo mode** on your computer: orders are saved and marked as paid with a simulated payment, so you can try the whole flow. Demo mode **never** runs in production; there, checkout stays disabled until Stripe is configured.

1. Create an account at https://dashboard.stripe.com/register.
2. Go to **Developers → API keys** and copy the **Secret key** (`sk_test_…` while testing, `sk_live_…` once you go live).
3. Put it in `.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   ```
4. **Webhook** (marks orders as Paid even if a customer closes the tab after paying):
   - **On your computer:** install the Stripe CLI (https://docs.stripe.com/stripe-cli), then run
     `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
     and copy the `whsec_…` value it prints into `STRIPE_WEBHOOK_SECRET`.
   - **In production:** Stripe Dashboard → **Developers → Webhooks → Add endpoint**
     - URL: `https://YOUR-DOMAIN/api/webhooks/stripe`
     - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`
     - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Restart the site. Test with card `4242 4242 4242 4242`, any future expiry date and any CVC.
6. Set your currency and shipping in `.env`: `STORE_CURRENCY` (e.g. `usd`, `gbp`, `eur`, `sar`, `aed`), `SHIPPING_FLAT_RATE`, `FREE_SHIPPING_THRESHOLD` and `SHIPPING_COUNTRIES`.

## Deploy (recommended: Vercel + Neon Postgres)

1. **Push the code to GitHub** (see below).
2. **Database:** create a free Postgres database at https://neon.tech (or Supabase or Railway) and copy its connection string.
3. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and commit.
4. **Vercel:** https://vercel.com → *Add New Project* → import your GitHub repo.
5. In Vercel → **Storage**, create a **Blob** store and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` so uploaded photos are kept permanently.
6. In Vercel → **Settings → Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your Postgres connection string |
   | `AUTH_SECRET` | a new long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
   | `STRIPE_SECRET_KEY` | `sk_live_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` (from step 4 above, using your live URL) |
   | `STORE_CURRENCY`, `SHIPPING_FLAT_RATE`, `FREE_SHIPPING_THRESHOLD`, `SHIPPING_COUNTRIES` | your store settings |
   | `SUPPLIER_EMAIL` | optional |
7. Create the tables and sample products in the production database from your computer, using the production connection string:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npm run db:seed        # optional sample products
   DATABASE_URL="postgresql://..." npm run admin:create
   ```
   (In PowerShell, run `$env:DATABASE_URL="postgresql://..."` first, then the commands without the prefix.)
8. Deploy, then add your domain in Vercel → **Domains**.

**Alternative:** any Node host with a persistent disk (Railway, Render, a VPS) can run `npm run build && npm start`. That setup can keep SQLite and the local `uploads/` folder.

## Day-to-day

- **New order:** open **Admin → Orders**. Paid orders waiting for you show on the dashboard.
- **Send to supplier:** open the order, click **Copy details** (or **Open in email**), send it to your supplier, then click **Mark as sent to supplier**.
- **Shipped:** add the carrier and tracking number, set status to **Shipped**, and later **Completed**.
- Only **Paid** orders can be marked as sent, shipped or completed.
- **Hide vs delete:** hide a product to take it off the store but keep it. Deleting removes it; past orders keep their own copy of the name, size and price.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the site locally |
| `npm run setup` | First-time setup (.env, database, sample products) |
| `npm run admin:create` | Create an admin or reset a password |
| `npm run db:seed` | Re-add or refresh the sample products |
| `npm run db:reset` | ⚠️ Erase **everything** in the local database and start again |
| `npm run typecheck` | Check the code for type errors |
| `npm run build` / `npm start` | Production build / run it |
