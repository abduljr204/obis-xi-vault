import Link from "next/link";
import { Crown, Sparkle } from "@/components/ui/Brand";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-coal">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Crown className="mb-4 h-6 w-10" />
          <p className="font-display text-2xl font-bold">OBI&rsquo;S XI VAULT</p>
          <p className="eyebrow mt-3">Football jerseys × Classics × More</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mute">
            Curated football and basketball jerseys, from modern Metro kits to the classics that defined an era.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-mute">
            <li>
              <a className="hover:text-ivory" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram @{INSTAGRAM_HANDLE}</a>
            </li>
            <li>
              <a className="break-all hover:text-ivory" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4 text-bone">Shop</p>
          <ul className="space-y-3 text-sm text-mute">
            <li><Link className="hover:text-ivory" href="/shop">All jerseys</Link></li>
            <li><Link className="hover:text-ivory" href="/shop?sport=football">Football</Link></li>
            <li><Link className="hover:text-ivory" href="/shop?sport=basketball">Basketball</Link></li>
            <li><Link className="hover:text-ivory" href="/shop?collection=New">New in</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4 text-bone">Collections</p>
          <ul className="space-y-3 text-sm text-mute">
            <li><Link className="hover:text-ivory" href="/shop?collection=Metro">Metro</Link></li>
            <li><Link className="hover:text-ivory" href="/shop?collection=Classic">Classic</Link></li>
            <li><Link className="hover:text-ivory" href="/shop?collection=Retro">Retro</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4 text-bone">Help</p>
          <ul className="space-y-3 text-sm text-mute">
            <li><Link className="hover:text-ivory" href="/contact">Contact us</Link></li>
            <li><Link className="hover:text-ivory" href="/shipping">Shipping</Link></li>
            <li><Link className="hover:text-ivory" href="/returns">Returns &amp; refunds</Link></li>
            <li><Link className="hover:text-ivory" href="/request">Request a jersey</Link></li>
            <li><Link className="hover:text-ivory" href="/cart">Your cart</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} Obi&rsquo;s XI Vault. All rights reserved. ·{" "}
            <Link className="hover:text-ivory" href="/privacy">Privacy</Link> ·{" "}
            <Link className="hover:text-ivory" href="/terms">Terms of sale</Link>
          </p>
          <p className="flex items-center gap-2">
            <Sparkle className="h-3 w-3" /> Card details are handled by Stripe and never stored on our servers.
          </p>
        </div>
      </div>
    </footer>
  );
}
