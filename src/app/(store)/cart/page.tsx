import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="container-x pt-10 sm:pt-16">
      <p className="eyebrow">Ready when you are</p>
      <h1 className="font-display mt-3 mb-10 text-4xl font-bold sm:text-6xl">Your cart</h1>
      <CartView flatRate={storeConfig.shippingFlatRate} freeThreshold={storeConfig.freeShippingThreshold} />
    </div>
  );
}
