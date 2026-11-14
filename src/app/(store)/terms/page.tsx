import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { CONTACT_EMAIL, STORE_NAME, STORE_PROVINCE } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of sale", description: "The terms that apply when you buy from Obi's XI Vault." };

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="The fine print"
      title="Terms of sale"
      current="/terms"
      intro={`These terms apply when you buy from ${STORE_NAME}. By placing an order, you agree to them, together with our Shipping and Returns & refunds policies.`}
    >
      <PolicySection title="Our products">
        <p>
          We describe and photograph every jersey as accurately as we can. Colours can look slightly different on different screens, and small
          details can vary. Sizes follow the jersey&rsquo;s label; please check the size guide on the product page before ordering.
        </p>
      </PolicySection>

      <PolicySection title="Prices and payment">
        <ul>
          <li>Prices are in <strong>Canadian dollars</strong>. The total, including shipping, is shown at checkout before you pay.</li>
          <li>Payments are processed securely by <strong>Stripe</strong>. Your order is confirmed once your payment succeeds, and we email you a confirmation.</li>
          <li>
            If a jersey turns out to be unavailable, or a price was shown incorrectly, we&rsquo;ll let you know and give you a full refund for that item if
            you no longer want it.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Shipping">
        <p>Where we ship, costs and delivery times are explained in our <Link href="/shipping">Shipping policy</Link>.</p>
      </PolicySection>

      <PolicySection title="Returns and refunds">
        <p>
          All sales are final, except when an item is wrong, damaged, defective or lost. See <Link href="/returns">Returns &amp; refunds</Link>. Nothing in these
          terms limits the rights you have under the consumer protection laws that apply to you.
        </p>
      </PolicySection>

      <PolicySection title="Jersey requests">
        <p>
          When you ask us to find a jersey, we&rsquo;ll try our best, but we can&rsquo;t guarantee we&rsquo;ll find it. A price we quote you is only
          an order once you&rsquo;ve paid for it.
        </p>
      </PolicySection>

      <PolicySection title="Team names and logos">
        <p>
          Team names, crests, logos and player names belong to their respective owners. {STORE_NAME} is an independent retailer and isn&rsquo;t
          affiliated with or endorsed by any club, league or player.
        </p>
      </PolicySection>

      <PolicySection title="Our responsibility">
        <p>
          To the extent the law allows, our responsibility for any order is limited to the amount you paid for it. We aren&rsquo;t responsible for
          delays caused by events outside our control, such as carrier disruptions or severe weather.
        </p>
      </PolicySection>

      <PolicySection title="Governing law">
        <p>
          {STORE_NAME} is based in {STORE_PROVINCE}, Canada. These terms are governed by the laws of the Province of {STORE_PROVINCE} and the
          federal laws of Canada that apply there.
        </p>
      </PolicySection>

      <PolicySection title="Changes and contact">
        <p>
          We may update these terms from time to time; your order is covered by the version in place when you placed it. Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
