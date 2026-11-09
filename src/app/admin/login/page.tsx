import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown } from "@/components/ui/Brand";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; out?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  return (
    <main className="grain flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-10 text-center">
          <Crown className="mx-auto h-8 w-12" />
          <p className="font-display mt-4 text-2xl font-bold">OBI&rsquo;S XI VAULT</p>
          <p className="eyebrow mt-2">Admin area</p>
        </div>
        <div className="card p-7">
          {sp.out && <p role="status" className="mb-5 rounded-xl border border-line-strong px-4 py-3 text-sm text-bone">You&rsquo;ve been signed out.</p>}
          <LoginForm next={sp.next} />
        </div>
        <p className="mt-6 text-center text-xs text-faint">
          <Link href="/" className="hover:text-ivory">← Back to the store</Link>
        </p>
      </div>
    </main>
  );
}
