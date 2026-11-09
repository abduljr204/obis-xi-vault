import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/Badges";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const PAGE_SIZE = 25;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.some((s) => s.value === sp.status) ? sp.status : undefined;
  const payment = PAYMENT_STATUSES.some((s) => s.value === sp.payment) ? sp.payment : undefined;
  const q = sp.q?.trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(payment && { paymentStatus: payment }),
    ...(q && { OR: [{ orderNumber: { contains: q.toUpperCase() } }, { customerName: { contains: q } }, { email: { contains: q.toLowerCase() } }] }),
  };

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: { select: { quantity: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { status, payment, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    return `/admin/orders${next.size ? `?${next}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Orders</h1>
        </div>
        <form className="flex gap-2 sm:w-96">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Order #, name or email" aria-label="Search orders" className="input !min-h-10 !rounded-full !py-2 text-sm" />
          <select name="payment" defaultValue={payment ?? ""} aria-label="Payment status" className="input !min-h-10 !w-auto !rounded-full !py-2 text-sm">
            <option value="">Any payment</option>
            {PAYMENT_STATUSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm">Go</button>
        </form>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        <Link href={link({ status: undefined, page: undefined })} className={cn("rounded-full border px-4 py-1.5 text-xs", !status ? "border-ivory bg-ivory text-ink" : "border-line text-bone hover:border-ivory")}>
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s.value} href={link({ status: s.value, page: undefined })} className={cn("rounded-full border px-4 py-1.5 text-xs", status === s.value ? "border-ivory bg-ivory text-ink" : "border-line text-bone hover:border-ivory")}>
            {s.label} <span className="opacity-60">{countFor(s.value)}</span>
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="card px-6 py-16 text-center text-mute">No orders match these filters.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs text-faint">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="group relative hover:bg-raise/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium after:absolute after:inset-0 group-hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-mute">{o.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-5 py-3">
                    {o.customerName}
                    <p className="text-xs text-faint">{o.email}</p>
                  </td>
                  <td className="px-5 py-3">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="px-5 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                  <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right">{formatMoney(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-mute">
          <span>Page {page} of {pages} · {total} orders</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn btn-ghost btn-sm">← Previous</Link>}
            {page < pages && <Link href={link({ page: String(page + 1) })} className="btn btn-ghost btn-sm">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
