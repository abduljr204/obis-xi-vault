import { Suspense } from "react";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Suspense fallback={<div className="h-[4.5rem]" />}>
        <Header />
      </Suspense>
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
