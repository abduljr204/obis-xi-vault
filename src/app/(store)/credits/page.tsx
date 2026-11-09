import type { Metadata } from "next";
import credits from "@/lib/photo-credits.json";

export const metadata: Metadata = { title: "Photo credits" };

type Credit = { product: string; title: string; page: string; author: string; license: string; licenseUrl: string };

export default function CreditsPage() {
  return (
    <section className="container-x py-16">
      <p className="eyebrow">Thank you</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Photo credits</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">
        Product photos come from Wikimedia Commons and are used under the free licences listed below. Some photos have
        been cropped and resized; those edited versions are shared under the same licence as the original. Team names
        and crests belong to their respective clubs and leagues.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {(credits as Credit[]).map((c) => (
          <li key={c.page} className="grid gap-1 py-4 text-sm sm:grid-cols-[1fr_1.4fr]">
            <span className="text-bone">{c.product}</span>
            <span className="text-mute">
              <a className="underline hover:text-ivory" href={c.page} target="_blank" rel="noopener noreferrer">
                {c.title}
              </a>
              {" by "}
              {c.author}
              {", "}
              {c.licenseUrl ? (
                <a className="underline hover:text-ivory" href={c.licenseUrl} target="_blank" rel="noopener noreferrer">
                  {c.license}
                </a>
              ) : (
                c.license
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
