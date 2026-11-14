import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, LOST_PARCEL_DAYS, PROBLEM_REPORT_DAYS, STORE_PROVINCE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: "All sales are final, except when something is wrong with your order. Here's what we cover and how to reach us.",
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Our promise"
      title="Returns & refunds"
      current="/returns"
      intro="All sales are final, but if something is wrong with your order, we'll make it right."
    >
      <div className="card p-6 text-bone">
        <p className="font-semibold text-ivory">In short</p>
        <ul className="mt-2">
          <li><strong>No returns or refunds for a change of mind.</strong></li>
          <li><strong>Wrong, damaged, defective or lost?</strong> We replace it or refund you in full, and we cover any return shipping.</li>
        </ul>
      </div>

      <PolicySection title="Change of mind">
        <p>We don&rsquo;t accept returns or give refunds if you change your mind, for example if you:</p>
        <ul>
          <li>no longer want the jersey,</li>
          <li>ordered the wrong size or don&rsquo;t like the fit, or</li>
          <li>ordered a jersey with a name and number printed on it.</li>
        </ul>
        <p>Please check the <strong>size guide</strong> on each product page before ordering. If you&rsquo;re unsure about sizing, <Link href="/contact">ask us</Link> first.</p>
      </PolicySection>

      <PolicySection title="When something is wrong with your order">
        <p>We&rsquo;ll replace the jersey or give you a full refund, including shipping, if:</p>
        <ul>
          <li>you received a <strong>different item or size</strong> from what you ordered,</li>
          <li>the jersey arrived <strong>damaged or defective</strong>, or</li>
          <li>your parcel was <strong>lost</strong> and hasn&rsquo;t arrived {LOST_PARCEL_DAYS} days after it shipped.</li>
        </ul>
      </PolicySection>

      <PolicySection title="How to report a problem">
        <ul>
          <li>
            Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or message us on Instagram{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@{INSTAGRAM_HANDLE}</a>{" "}
            <strong>within {PROBLEM_REPORT_DAYS} days of delivery</strong>.
          </li>
          <li>Include your <strong>order number</strong> (it starts with OXV-) and <strong>photos</strong> of the jersey, its label and the packaging.</li>
          <li>Please keep the jersey unworn and unwashed, with its tags, while we sort it out.</li>
        </ul>
      </PolicySection>

      <PolicySection title="What happens next">
        <p>
          We&rsquo;ll review your message and reply with the next steps. If we need the jersey back, <strong>we pay for the return shipping</strong>.
          Then we&rsquo;ll send you a replacement or a full refund, whichever you prefer, if the item is still available.
        </p>
        <p>
          Refunds go back to the card you paid with. Once we&rsquo;ve issued it, it usually takes 5–10 business days to appear on your statement,
          depending on your bank.
        </p>
      </PolicySection>

      <PolicySection title="Cancelling an order">
        <p>
          Need to cancel? Contact us as soon as possible. We can cancel and fully refund an order as long as it hasn&rsquo;t been processed yet.
        </p>
      </PolicySection>

      <PolicySection title="Your rights">
        <p>
          This policy doesn&rsquo;t affect any rights you have under {STORE_PROVINCE}&rsquo;s <em>Consumer Protection Act</em> or the other consumer
          protection laws that apply to you.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
