import type { Metadata } from "next";
import { RequestForm } from "@/components/store/RequestForm";
import { sportFromSlug } from "@/lib/constants";
import { first } from "@/lib/utils";
import { submitJerseyRequest } from "./actions";

export const metadata: Metadata = {
  title: "Request a jersey",
  description: "Can't find the jersey you want? Tell us the team, season and size and we'll track it down for you.",
};

const STEPS = [
  { n: "01", title: "Tell us what you want", text: "Team, season, size and any name or number for the back." },
  { n: "02", title: "We track it down", text: "We check with our suppliers for availability and the best price." },
  { n: "03", title: "Get a quote", text: "We email you with a price, usually within 2–3 working days. No obligation." },
];

export default async function RequestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const defaults = { sport: sportFromSlug(first(sp.sport)), team: first(sp.team)?.slice(0, 100) };

  return (
    <section className="container-x py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Can&rsquo;t find it in the shop?</p>
          <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">Request a jersey</h1>
          <p className="mt-5 max-w-md leading-relaxed text-mute">
            Looking for a specific club, national team or NBA jersey, a classic from years ago, or one with a certain name on
            the back? Tell us and we&rsquo;ll try to find it for you.
          </p>
          <ol className="mt-10 space-y-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-display text-sm text-faint">{s.n}</span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-mute">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <RequestForm action={submitJerseyRequest} defaults={defaults} />
      </div>
    </section>
  );
}
