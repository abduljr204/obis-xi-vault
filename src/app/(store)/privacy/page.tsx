import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { CONTACT_EMAIL, STORE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy policy", description: "What personal information we collect, why, who we share it with and your choices." };

export default function PrivacyPage() {
  const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <PolicyPage
      eyebrow="Your information"
      title="Privacy policy"
      current="/privacy"
      intro={`${STORE_NAME} only collects the information we need to sell you jerseys and deliver them. We don't sell your information or use it for advertising.`}
    >
      <PolicySection title="What we collect">
        <ul>
          <li><strong>When you order:</strong> your name, email address, phone number, shipping address, the items you ordered and any note you add.</li>
          <li><strong>When you request a jersey:</strong> your name, email address, phone number if you give it, and the details of the jersey you&rsquo;re looking for.</li>
          <li>
            <strong>Payment details:</strong> you pay on Stripe&rsquo;s secure page. Stripe handles your card details; <strong>we never see or store your card number</strong>.
          </li>
          <li>
            <strong>Your cart</strong> is saved in your own browser so it&rsquo;s still there when you come back. We don&rsquo;t use advertising or analytics trackers.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How we use it">
        <ul>
          <li>to process, pack and deliver your order,</li>
          <li>to send you your order confirmation and shipping updates, and to answer your questions,</li>
          <li>to look for the jerseys you request,</li>
          <li>to prevent fraud, and</li>
          <li>to keep the records we&rsquo;re required to keep, for example for tax and accounting.</li>
        </ul>
        <p>We don&rsquo;t send marketing emails unless you&rsquo;ve asked us to.</p>
      </PolicySection>

      <PolicySection title="Who we share it with">
        <p>Only with the companies that help us run the store, and only what they need:</p>
        <ul>
          <li><strong>Stripe</strong>, to process your payment,</li>
          <li><strong>our supplier and shipping carriers</strong>, to prepare and deliver your order (your name, address and phone number),</li>
          <li><strong>the services that host our website, database and email</strong> (Vercel, Prisma and Google).</li>
        </ul>
        <p>We never sell or rent your personal information. We may share it if the law requires us to.</p>
      </PolicySection>

      <PolicySection title="Where it's stored">
        <p>
          Our service providers may store and process your information outside Canada, including in the United States. There, it&rsquo;s protected
          by their security measures but may be accessible to authorities under local laws.
        </p>
      </PolicySection>

      <PolicySection title="How long we keep it">
        <p>
          We keep order information for as long as we need it to serve you and to meet our legal obligations. Tax and accounting records are
          usually kept for six years. Jersey requests we no longer need are deleted.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You can ask to see the personal information we hold about you, correct it, or have it deleted when we no longer need to keep it. Email us
          at {email}, and we&rsquo;ll reply within 30 days.
        </p>
        <p>
          If you have a concern we haven&rsquo;t resolved, you can contact the{" "}
          <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer">Office of the Privacy Commissioner of Canada</a>.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about your privacy? Email {email} or see our <Link href="/contact">contact page</Link>. We may update this policy from time to
          time; the date below shows the latest version.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
