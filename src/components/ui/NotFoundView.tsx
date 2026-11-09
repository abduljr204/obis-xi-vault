import Link from "next/link";
import { Crown } from "./Brand";

export function NotFoundView() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Crown className="h-10 w-16 animate-float" />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-6xl">Not in the vault</h1>
      <p className="mt-4 max-w-md text-mute">The page or jersey you&rsquo;re looking for has moved or no longer exists.</p>
      <Link href="/shop" className="btn btn-primary mt-8">Browse jerseys</Link>
    </div>
  );
}
