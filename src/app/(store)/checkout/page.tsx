import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { demoPaymentsAllowed, stripeEnabled, storeConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const paymentMode = stripeEnabled() ? "stripe" : demoPaymentsAllowed() ? "demo" : "disabled";
  return (
    <div className="container-x pt-10 sm:pt-16">
      <p className="eyebrow">Almost yours</p>
      <h1 className="font-display mt-3 mb-10 text-4xl font-bold sm:text-6xl">Checkout</h1>
      <CheckoutForm
        countries={storeConfig.shippingCountries}
        flatRate={storeConfig.shippingFlatRate}
        freeThreshold={storeConfig.freeShippingThreshold}
        paymentMode={paymentMode}
        canceled={Boolean(sp.canceled)}
      />
    </div>
  );
}
