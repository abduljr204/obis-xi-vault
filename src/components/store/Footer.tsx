import Link from "next/link";
import { Crown, Sparkle } from "@/components/ui/Brand";

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
            <li>Secure checkout by Stripe</li>
            <li>Tracked worldwide shipping</li>
            <li><Link className="hover:text-ivory" href="/request">Request a jersey</Link></li>
            <li><Link className="hover:text-ivory" href="/cart">Your cart</Link></li>
            <li><Link className="hover:text-ivory" href="/credits">Photo credits</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Obi&rsquo;s XI Vault. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Sparkle className="h-3 w-3" /> Card details are handled by Stripe and never stored on our servers.
          </p>
        </div>
      </div>
    </footer>
  );
}
