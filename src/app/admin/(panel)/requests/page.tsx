import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { RequestStatusBadge } from "@/components/admin/Badges";
import { FlashToast } from "@/components/ui/Toast";
import { REQUEST_STATUSES, sportLabel } from "@/lib/constants";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Jersey requests" };

const PAGE_SIZE = 25;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = REQUEST_STATUSES.some((s) => s.value === sp.status) ? sp.status : undefined;
  const q = sp.q?.trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.JerseyRequestWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { requestNumber: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { team: { contains: q, mode: "insensitive" } },
        { player: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [requests, total, counts] = await Promise.all([
    db.jerseyRequest.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.jerseyRequest.count({ where }),
    db.jerseyRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, q, ...patch })) if (v) next.set(k, v);
    return `/admin/requests${next.size ? `?${next}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <FlashToast message={sp.deleted ? "Request deleted" : null} />
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Customers</p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Jersey requests</h1>
        </div>
        <form className="flex gap-2 sm:w-96">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Ref, name, email, team or player" aria-label="Search requests" className="input !min-h-10 !rounded-full !py-2 text-sm" />
          <button className="btn btn-ghost btn-sm">Go</button>
        </form>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        <Link href={link({ status: undefined, page: undefined })} className={cn("rounded-full border px-4 py-1.5 text-xs", !status ? "border-ivory bg-ivory text-ink" : "border-line text-bone hover:border-ivory")}>
          All
        </Link>
        {REQUEST_STATUSES.map((s) => (
          <Link key={s.value} href={link({ status: s.value, page: undefined })} className={cn("rounded-full border px-4 py-1.5 text-xs", status === s.value ? "border-ivory bg-ivory text-ink" : "border-line text-bone hover:border-ivory")}>
            {s.label} <span className="opacity-60">{countFor(s.value)}</span>
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? (
        <div className="card px-6 py-16 text-center text-mute">
          {status || q ? "No requests match these filters." : "No jersey requests yet. They'll appear here when customers use the Request a jersey form."}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs text-faint">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Jersey</th>
                <th className="px-5 py-3 font-medium">Size × Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r.id} className="group relative hover:bg-raise/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/requests/${r.id}`} className="font-medium after:absolute after:inset-0 group-hover:underline">{r.requestNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-mute">{r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-5 py-3">
                    {r.name}
                    <p className="text-xs text-faint">{r.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    {r.team}
                    <p className="text-xs text-faint">{[sportLabel(r.sport), r.season, r.player].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="px-5 py-3">{r.size} × {r.quantity}</td>
                  <td className="px-5 py-3"><RequestStatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-mute">
          <span>Page {page} of {pages} · {total} requests</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn btn-ghost btn-sm">← Previous</Link>}
            {page < pages && <Link href={link({ page: String(page + 1) })} className="btn btn-ghost btn-sm">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
