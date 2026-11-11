import "server-only";
import type { Prisma } from "@prisma/client";
import { storeConfig } from "./config";
import { STORE_NAME } from "./constants";
import { db } from "./db";
import { sendEmail, type Email } from "./email";
import { formatMoney } from "./money";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

// ── Triggers ───────────────────────────────────────────────────

/** Customer confirmation + new-order alert to the store owner. Never throws. */
export async function sendOrderPaidEmails(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order || order.paymentStatus !== "PAID") return;
  await safeSend("order confirmation", order, confirmationEmail(order));
  const owner = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (owner) await safeSend("new-order alert", order, ownerAlertEmail(order, owner));
}

/** "Your order has shipped" (with tracking when available). Never throws. */
export async function sendOrderShippedEmail(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order || order.status !== "SHIPPED") return;
  await safeSend("shipping update", order, shippedEmail(order));
}

async function loadOrder(id: string) {
  try {
    return await db.order.findUnique({ where: { id }, include: { items: true } });
  } catch (err) {
    console.error("[email] could not load order", id, err);
    return null;
  }
}

async function safeSend(kind: string, order: OrderWithItems, email: Email) {
  try {
    await sendEmail(email);
  } catch (err) {
    console.error(`[email] ${kind} for ${order.orderNumber} failed`, err);
  }
}

// ── Templates ──────────────────────────────────────────────────

function confirmationEmail(order: OrderWithItems): Email {
  const first = firstName(order.customerName);
  const subject = `Order confirmed – ${order.orderNumber}`;
  const html = layout({
    title: subject,
    preheader: `Thanks for your order! We're getting your jerseys ready.`,
    body: `
      ${h1(`Thanks for your order, ${esc(first)}!`)}
      ${p(`We've received your payment for order <strong>${esc(order.orderNumber)}</strong> and we're getting your jerseys ready. We'll email you again with tracking details as soon as it ships.`)}
      ${itemsTable(order, true)}
      ${totalsTable(order)}
      ${section("Shipping to", addressHtml(order))}
      ${button("View your order", url(`/order/${order.id}`))}`,
    footer: `Questions about your order? Just reply to this email.`,
  });
  const text = [
    `Thanks for your order, ${first}!`,
    ``,
    `We've received your payment for order ${order.orderNumber} and we're getting your jerseys ready.`,
    `We'll email you again with tracking details as soon as it ships.`,
    ``,
    ...itemsText(order, true),
    ``,
    ...totalsText(order),
    ``,
    `Shipping to:`,
    ...addressLines(order),
    ``,
    `View your order: ${url(`/order/${order.id}`)}`,
    ``,
    `Questions? Just reply to this email.`,
    STORE_NAME,
  ].join("\n");
  return { to: order.email, subject, html, text };
}

function shippedEmail(order: OrderWithItems): Email {
  const first = firstName(order.customerName);
  const tracking = order.trackingNumber?.trim();
  const carrier = order.carrier?.trim();
  const trackUrl = tracking ? trackingUrl(carrier, tracking) : null;
  const subject = `Your order ${order.orderNumber} is on its way`;

  const trackingRows = [
    carrier ? row("Carrier", esc(carrier)) : "",
    tracking ? row("Tracking number", `<strong>${esc(tracking)}</strong>`) : "",
  ].join("");
  const trackingBox = trackingRows
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f8f6f0;border-radius:12px;"><tr><td style="padding:16px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${trackingRows}</table></td></tr></table>`
    : "";

  const html = layout({
    title: subject,
    preheader: `Good news — your order has shipped${tracking ? " and you can track it" : ""}.`,
    body: `
      ${h1("Your order is on its way")}
      ${p(`Good news, ${esc(first)}: order <strong>${esc(order.orderNumber)}</strong> has shipped.`)}
      ${trackingBox}
      ${trackUrl ? button("Track your package", trackUrl) : ""}
      ${itemsTable(order, false)}
      ${section("Shipping to", addressHtml(order))}
      ${button("View your order", url(`/order/${order.id}`), !!trackUrl)}`,
    footer: `Questions about your delivery? Just reply to this email.`,
  });
  const text = [
    `Good news, ${first}: order ${order.orderNumber} has shipped.`,
    ``,
    ...(carrier ? [`Carrier: ${carrier}`] : []),
    ...(tracking ? [`Tracking number: ${tracking}`] : []),
    ...(trackUrl ? [`Track your package: ${trackUrl}`] : []),
    ...(carrier || tracking ? [``] : []),
    ...itemsText(order, false),
    ``,
    `Shipping to:`,
    ...addressLines(order),
    ``,
    `View your order: ${url(`/order/${order.id}`)}`,
    ``,
    `Questions? Just reply to this email.`,
    STORE_NAME,
  ].join("\n");
  return { to: order.email, subject, html, text };
}

function ownerAlertEmail(order: OrderWithItems, to: string): Email {
  const total = formatMoney(order.total, order.currency);
  const subject = `New order ${order.orderNumber} – ${total}`;
  const adminUrl = url(`/admin/orders/${order.id}`);
  const html = layout({
    title: subject,
    preheader: `${order.customerName} paid ${total}.`,
    body: `
      ${h1("New paid order")}
      ${p(`<strong>${esc(order.orderNumber)}</strong> · ${esc(total)} · paid by ${esc(order.customerName)}`)}
      ${itemsTable(order, true)}
      ${totalsTable(order)}
      ${section("Customer", `${esc(order.customerName)}<br>${esc(order.email)}<br>${esc(order.phone)}`)}
      ${section("Ship to", addressHtml(order))}
      ${order.customerNote ? section("Customer note", esc(order.customerNote).replace(/\n/g, "<br>")) : ""}
      ${button("Open in admin", adminUrl)}`,
    footer: `Replying to this email writes to the customer.`,
  });
  const text = [
    `New paid order ${order.orderNumber} (${total})`,
    ``,
    ...itemsText(order, true),
    ``,
    ...totalsText(order),
    ``,
    `Customer: ${order.customerName}, ${order.email}, ${order.phone}`,
    `Ship to:`,
    ...addressLines(order),
    ...(order.customerNote ? [``, `Customer note: ${order.customerNote}`] : []),
    ``,
    `Open in admin: ${adminUrl}`,
  ].join("\n");
  return { to, subject, html, text, replyTo: order.email };
}

// ── Building blocks ────────────────────────────────────────────

const FONT = "Arial,Helvetica,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

function layout({ title, preheader, body, footer }: { title: string; preheader: string; body: string; footer: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f3efe6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe6;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e4dfd3;border-radius:16px;overflow:hidden;">
<tr><td style="background:#000000;padding:28px 32px;text-align:center;">
<div style="font-family:${SERIF};color:#f3efe6;font-size:22px;font-weight:bold;letter-spacing:4px;">${esc(STORE_NAME.toUpperCase())}</div>
<div style="font-family:${FONT};color:#c9a447;font-size:10px;letter-spacing:3px;margin-top:8px;">FOOTBALL · BASKETBALL · CLASSICS</div>
</td></tr>
<tr><td style="padding:32px;font-family:${FONT};color:#1a1a1a;font-size:15px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #eee9de;font-family:${FONT};color:#8f8b83;font-size:12px;line-height:1.6;text-align:center;">
${esc(footer)}<br><a href="${esc(url("/"))}" style="color:#8f8b83;">${esc(STORE_NAME)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

const h1 = (html: string) => `<h1 style="font-family:${SERIF};font-size:24px;line-height:1.3;color:#000;margin:0 0 12px;">${html}</h1>`;
const p = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`;
const row = (label: string, value: string) =>
  `<tr><td style="font-family:${FONT};font-size:13px;color:#6b6760;padding:3px 0;">${esc(label)}</td><td align="right" style="font-family:${FONT};font-size:14px;color:#1a1a1a;padding:3px 0;">${value}</td></tr>`;

function section(label: string, html: string) {
  return `<div style="margin:24px 0 0;"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8f8b83;margin-bottom:6px;">${esc(label)}</div><div style="font-size:14px;line-height:1.6;">${html}</div></div>`;
}

function button(label: string, href: string, secondary = false) {
  const style = secondary
    ? "background:#ffffff;color:#000000;border:1px solid #000000;"
    : "background:#000000;color:#f3efe6;border:1px solid #000000;";
  return `<div style="margin:28px 0 0;text-align:center;"><a href="${esc(href)}" style="${style}display:inline-block;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:999px;">${esc(label)}</a></div>`;
}

function itemsTable(order: OrderWithItems, withPrices: boolean) {
  const showImages = storeConfig.siteUrl.startsWith("https://");
  const rows = order.items
    .map((item) => {
      const img = item.imageUrl && showImages ? absolute(item.imageUrl) : null;
      return `<tr>
${img ? `<td width="64" style="padding:12px 12px 12px 0;vertical-align:top;"><img src="${esc(img)}" width="56" height="70" alt="" style="display:block;width:56px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #eee9de;"></td>` : ""}
<td style="padding:12px 0;vertical-align:top;font-family:${FONT};">
<div style="font-size:14px;font-weight:bold;color:#000;">${esc(item.productName)}</div>
<div style="font-size:13px;color:#6b6760;">Size ${esc(item.size)} · Qty ${item.quantity}</div>
</td>
${withPrices ? `<td align="right" style="padding:12px 0 12px 12px;vertical-align:top;font-family:${FONT};font-size:14px;white-space:nowrap;">${esc(formatMoney(item.unitPrice * item.quantity, order.currency))}</td>` : ""}
</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-top:1px solid #eee9de;border-bottom:1px solid #eee9de;">${rows}</table>`;
}

function totalsTable(order: OrderWithItems) {
  const shipping = order.shippingCost === 0 ? "Free" : formatMoney(order.shippingCost, order.currency);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0;">
${row("Subtotal", esc(formatMoney(order.subtotal, order.currency)))}
${row("Shipping", esc(shipping))}
<tr><td style="font-family:${FONT};font-size:15px;font-weight:bold;padding:8px 0 0;">Total</td><td align="right" style="font-family:${SERIF};font-size:18px;font-weight:bold;padding:8px 0 0;">${esc(formatMoney(order.total, order.currency))}</td></tr>
</table>`;
}

function itemsText(order: OrderWithItems, withPrices: boolean) {
  return order.items.map(
    (i) => `- ${i.quantity} x ${i.productName} (Size ${i.size})${withPrices ? `  ${formatMoney(i.unitPrice * i.quantity, order.currency)}` : ""}`,
  );
}

function totalsText(order: OrderWithItems) {
  return [
    `Subtotal: ${formatMoney(order.subtotal, order.currency)}`,
    `Shipping: ${order.shippingCost === 0 ? "Free" : formatMoney(order.shippingCost, order.currency)}`,
    `Total: ${formatMoney(order.total, order.currency)}`,
  ];
}

function addressLines(order: OrderWithItems) {
  let country = order.country;
  try {
    country = new Intl.DisplayNames(["en"], { type: "region" }).of(order.country) ?? order.country;
  } catch {}
  return [
    order.customerName,
    order.addressLine1,
    order.addressLine2,
    [order.city, order.state, order.postalCode].filter(Boolean).join(", "),
    country,
  ].filter((l): l is string => Boolean(l));
}

const addressHtml = (order: OrderWithItems) => addressLines(order).map(esc).join("<br>");

/** Link to the carrier's tracking page for common carriers; null if unknown. */
function trackingUrl(carrier: string | undefined, tracking: string) {
  const c = (carrier ?? "").toLowerCase();
  const n = encodeURIComponent(tracking);
  if (c.includes("canada post") || c.includes("postes canada")) return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${n}`;
  if (c.includes("purolator")) return `https://www.purolator.com/en/shipping/tracker?pin=${n}`;
  if (/\bups\b/.test(c)) return `https://www.ups.com/track?tracknum=${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
  if (c.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${n}`;
  return null;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
const url = (path: string) => `${storeConfig.siteUrl}${path}`;
const absolute = (u: string) => (u.startsWith("http") ? u : url(u));

function esc(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}
