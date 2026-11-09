import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import { CartProvider } from "@/components/store/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { storeConfig } from "@/lib/config";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cinzel", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.siteUrl),
  title: { default: "Obi's XI Vault | Football & Basketball Jerseys", template: "%s | Obi's XI Vault" },
  description: "Football jerseys, basketball jerseys, classics and more. Curated kits from the Metro, Classic and New collections.",
  openGraph: { images: ["/brand/logo.jpg"], siteName: "Obi's XI Vault" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-dvh">
        <ToastProvider>
          <CartProvider currency={storeConfig.currency}>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
