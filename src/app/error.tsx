"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">We dropped the ball</h1>
      <p className="mt-4 max-w-md text-mute">An unexpected error happened. Please try again — if it keeps happening, contact us.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-ghost">Home</Link>
      </div>
    </div>
  );
}
