import Link from "next/link";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/Badges";
import { storeConfig, stripeEnabled } from "@/lib/config";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function Dashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [toProcess, sent, revenue, productCount, recent, newRequests] = await Promise.all([
    db.order.count({ where: { status: "NEW", paymentStatus: "PAID" } }),
    db.order.count({ where: { status: "SENT_TO_SUPPLIER" } }),
    db.order.aggregate({ _sum: { total: true }, _count: true, where: { paymentStatus: "PAID", createdAt: { gte: since } } }),
    db.product.count({ where: { active: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { items: true } } } }),
    db.jerseyRequest.count({ where: { status: "NEW" } }),
  ]);

  const stats = [
    { label: "Paid orders to send to supplier", value: toProcess, href: "/admin/orders?status=NEW&payment=PAID" },
    { label: "Waiting on supplier", value: sent, href: "/admin/orders?status=SENT_TO_SUPPLIER" },
    { label: "Revenue, last 30 days", value: formatMoney(revenue._sum.total ?? 0, storeConfig.currency), sub: `${revenue._count} paid orders` },
    { label: "New jersey requests", value: newRequests, href: "/admin/requests?status=NEW" },
    { label: "Live products", value: productCount, href: "/admin/products" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Dashboard</h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ Add product</Link>
      </header>

      {!stripeEnabled() && (
        <div className="rounded-2xl border border-warn/40 bg-warn/5 px-5 py-4 text-sm text-warn">
          <strong>Payments are in demo mode.</strong> Add your Stripe keys to <code>.env</code> to accept real payments. See README → &ldquo;Configure payments&rdquo;.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {stats.map((s) => {
          const inner = (
            <>
              <p className="text-xs text-mute">{s.label}</p>
              <p className="font-display mt-3 text-3xl font-bold">{s.value}</p>
              {s.sub && <p className="mt-1 text-xs text-faint">{s.sub}</p>}
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="card p-6 transition-colors hover:border-line-strong">{inner}</Link>
          ) : (
            <div key={s.label} className="card p-6">{inner}</div>
          );
        })}
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs tracking-[0.16em] text-mute uppercase hover:text-ivory">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-12 text-center text-mute">No orders yet. They&rsquo;ll appear here as soon as a customer checks out.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-faint">
                <tr className="border-b border-line">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-raise/60">
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link>
                      <p className="text-xs text-faint">{o.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </td>
                    <td className="px-6 py-3">{o.customerName}</td>
                    <td className="px-6 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-6 py-3 text-right">{formatMoney(o.total, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
