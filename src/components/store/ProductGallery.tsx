"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { id: string; url: string; alt: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!current) {
    return <div className="flex aspect-[4/5] items-center justify-center rounded-3xl border border-line bg-panel text-faint">No photo yet</div>;
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col" role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 sm:h-24 sm:w-20",
                i === index ? "border-ivory" : "border-line opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl border border-line bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.alt || name}
          className="animate-fade-in h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden">
            {images.map((img, i) => (
              <span key={img.id} className={cn("h-1.5 rounded-full bg-ivory transition-all", i === index ? "w-5" : "w-1.5 opacity-40")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
