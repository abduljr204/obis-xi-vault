import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestStatusBadge } from "@/components/admin/Badges";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CopyBlock } from "@/components/admin/CopyBlock";
import { RequestUpdateForm } from "@/components/admin/RequestUpdateForm";
import { STORE_NAME, sportLabel } from "@/lib/constants";
import { db } from "@/lib/db";
import { deleteRequest, updateRequest } from "../actions";

export const metadata: Metadata = { title: "Jersey request" };

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.jerseyRequest.findUnique({ where: { id } });
  if (!r) notFound();

  const jersey = [
    ["Sport", sportLabel(r.sport)],
    ["Team", r.team],
    ["Season / version", r.season],
    ["Name & number", r.player],
    ["Size", r.size],
    ["Quantity", String(r.quantity)],
    ["Budget", r.budget],
  ].filter((row): row is [string, string] => !!row[1]);

  // Plain-text summary for asking the supplier (no customer contact details).
  const supplierText = [
    `JERSEY REQUEST ${r.requestNumber}`,
    ...jersey.filter(([k]) => k !== "Budget").map(([k, v]) => `${k}: ${v}`),
    ...(r.referenceUrl ? [`Reference: ${r.referenceUrl}`] : []),
    ...(r.notes ? ["", `Notes: ${r.notes}`] : []),
  ].join("\n");

  const supplierEmail = process.env.SUPPLIER_EMAIL?.trim();
  const supplierMailto = supplierEmail
    ? `mailto:${supplierEmail}?subject=${encodeURIComponent(`Availability check ${r.requestNumber}`)}&body=${encodeURIComponent(supplierText)}`
    : undefined;

  const firstName = r.name.split(/\s+/)[0];
  const replyMailto = `mailto:${r.email}?subject=${encodeURIComponent(`Your jersey request ${r.requestNumber} – ${STORE_NAME}`)}&body=${encodeURIComponent(
    `Hi ${firstName},\n\nThanks for your request for the ${[r.team, r.season].filter(Boolean).join(" ")} jersey${r.player ? ` (${r.player})` : ""}, size ${r.size}.\n\n\n\nBest regards,\n${STORE_NAME}`,
  )}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link href="/admin/requests" className="text-xs tracking-[0.16em] text-mute uppercase hover:text-ivory">← Requests</Link>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{r.requestNumber}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mute">
            <RequestStatusBadge status={r.status} />
            <span>· Received {r.createdAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</span>
          </div>
        </div>
        <a href={replyMailto} className="btn btn-primary btn-sm">Reply by email →</a>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <h2 className="font-display border-b border-line px-6 py-4 text-lg font-semibold">Requested jersey</h2>
            <dl className="divide-y divide-line text-sm">
              {jersey.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 px-6 py-3">
                  <dt className="text-mute">{k}</dt>
                  <dd className="break-words">{v}</dd>
                </div>
              ))}
              {r.referenceUrl && (
                <div className="grid grid-cols-[10rem_1fr] gap-4 px-6 py-3">
                  <dt className="text-mute">Reference link</dt>
                  <dd className="break-all">
                    <a href={r.referenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-4 hover:text-ivory">{r.referenceUrl}</a>
                  </dd>
                </div>
              )}
              {r.notes && (
                <div className="grid grid-cols-[10rem_1fr] gap-4 px-6 py-3">
                  <dt className="text-mute">Customer notes</dt>
                  <dd className="whitespace-pre-line">{r.notes}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-semibold">Ask your supplier</h2>
            <p className="mt-1 mb-4 text-sm text-mute">Copy these details to check availability and price, then mark the request as &ldquo;Sourcing&rdquo;.</p>
            <CopyBlock text={supplierText} mailto={supplierMailto} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-1 p-6 text-sm">
            <h2 className="field-label">Customer</h2>
            <p>{r.name}</p>
            <p><a href={`mailto:${r.email}`} className="text-mute hover:text-ivory hover:underline">{r.email}</a></p>
            {r.phone && <p><a href={`tel:${r.phone.replace(/[^+0-9]/g, "")}`} className="text-mute hover:text-ivory hover:underline">{r.phone}</a></p>}
          </section>

          <section className="card p-6">
            <h2 className="font-display mb-5 text-lg font-semibold">Update request</h2>
            <RequestUpdateForm action={updateRequest.bind(null, r.id)} initial={{ status: r.status, adminNotes: r.adminNotes ?? "" }} />
          </section>

          <form action={deleteRequest} className="text-right">
            <input type="hidden" name="id" value={r.id} />
            <ConfirmButton message={`Delete request ${r.requestNumber}? This can't be undone.`} className="text-xs text-faint underline underline-offset-4 hover:text-bad">
              Delete request
            </ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  );
}
