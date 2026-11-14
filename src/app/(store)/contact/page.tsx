import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact us", description: "Questions about a jersey or an order? Email us or message us on Instagram." };

export default function ContactPage() {
  return (
    <PolicyPage eyebrow="We're here to help" title="Contact us" current="/contact" intro="Questions about a jersey, sizing or an order? Get in touch and we'll get back to you as soon as we can.">
      <div className="grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${CONTACT_EMAIL}`} className="card group block p-6 no-underline! transition-colors hover:border-bone">
          <p className="eyebrow">Email</p>
          <p className="mt-2 break-all text-lg font-semibold text-ivory group-hover:underline">{CONTACT_EMAIL}</p>
          <p className="mt-2 text-sm text-mute">Best for order questions and anything that needs photos.</p>
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="card group block p-6 no-underline! transition-colors hover:border-bone">
          <p className="eyebrow">Instagram</p>
          <p className="mt-2 text-lg font-semibold text-ivory group-hover:underline">@{INSTAGRAM_HANDLE}</p>
          <p className="mt-2 text-sm text-mute">Send us a direct message, and see the latest drops.</p>
        </a>
      </div>

      <PolicySection title="Asking about an order?">
        <p>
          Please include your <strong>order number</strong>. It starts with <strong>OXV-</strong> and is in your order confirmation email. If
          something is wrong with your order, add a few photos of the jersey and its label so we can sort it out quickly.
        </p>
      </PolicySection>

      <PolicySection title="Looking for a jersey we don't list?">
        <p>
          Tell us the team, season, size and any name and number on our <Link href="/request">jersey request form</Link>, and we&rsquo;ll try to
          track it down for you.
        </p>
      </PolicySection>

      <PolicySection title="Useful links">
        <ul>
          <li><Link href="/shipping">Shipping</Link>: where we ship, costs and delivery times</li>
          <li><Link href="/returns">Returns &amp; refunds</Link>: what to do if there&rsquo;s a problem with your order</li>
        </ul>
      </PolicySection>
    </PolicyPage>
  );
}
