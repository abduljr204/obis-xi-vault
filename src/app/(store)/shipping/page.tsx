import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { storeConfig } from "@/lib/config";
import { CONTACT_EMAIL, DELIVERY_TIME, LOST_PARCEL_DAYS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { countryList } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping", description: "Where we ship, shipping costs, delivery times and tracking." };

export default function ShippingPage() {
  const { shippingCountries, shippingFlatRate, freeShippingThreshold, currency } = storeConfig;
  const countries = countryList(shippingCountries);

  return (
    <PolicyPage eyebrow="Delivery" title="Shipping" current="/shipping" intro={`We ship to ${countries}. Most orders arrive within ${DELIVERY_TIME}, with tracking.`}>
      <PolicySection title="Where we ship">
        <p>We currently ship to <strong>{countries}</strong>. Checkout only offers the countries we ship to.</p>
      </PolicySection>

      <PolicySection title="Shipping cost">
        <ul>
          <li>
            <strong>{shippingFlatRate > 0 ? formatMoney(shippingFlatRate, currency) : "Free"}</strong> per order
            {shippingFlatRate > 0 ? ", whatever the number of jerseys" : ""}.
          </li>
          {freeShippingThreshold > 0 && shippingFlatRate > 0 && (
            <li><strong>Free shipping</strong> on orders of {formatMoney(freeShippingThreshold, currency)} or more.</li>
          )}
        </ul>
        <p>The shipping cost is shown in your cart and at checkout before you pay. Prices are in Canadian dollars.</p>
      </PolicySection>

      <PolicySection title="Delivery time">
        <p>
          Most orders arrive within <strong>{DELIVERY_TIME}</strong> of being placed. This is an estimate: deliveries can occasionally take a little
          longer, for example around holidays.
        </p>
      </PolicySection>

      <PolicySection title="Tracking">
        <p>
          When your order ships, we email you the <strong>carrier and tracking number</strong>, with a tracking link where available. You can also
          see your order&rsquo;s status from the link in your order confirmation email.
        </p>
      </PolicySection>

      <PolicySection title="Your shipping address">
        <p>
          Please check your address carefully at checkout. If you spot a mistake, email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
          right away and we&rsquo;ll do our best to correct it before your order ships. We can&rsquo;t be responsible for orders delivered to an
          incorrect address entered at checkout.
        </p>
      </PolicySection>

      <PolicySection title="Late or lost parcels">
        <p>
          If your order hasn&rsquo;t arrived {LOST_PARCEL_DAYS} days after it shipped, contact us with your order number. We&rsquo;ll look into it
          with the carrier and, if the parcel is lost, send a replacement or give you a full refund. See{" "}
          <Link href="/returns">Returns &amp; refunds</Link>.
        </p>
      </PolicySection>

      <PolicySection title="Changing or cancelling an order">
        <p>
          Contact us as soon as possible. We can change or cancel an order, with a full refund, as long as it hasn&rsquo;t been processed yet. Once
          it&rsquo;s on its way, it can&rsquo;t be cancelled.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
