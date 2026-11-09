import { orderStatusLabel, paymentStatusLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ORDER_COLORS: Record<string, string> = {
  NEW: "border-ivory/50 text-ivory",
  SENT_TO_SUPPLIER: "border-[#8fb4ff]/50 text-[#a9c4ff]",
  SHIPPED: "border-warn/50 text-warn",
  COMPLETED: "border-ok/50 text-ok",
  CANCELLED: "border-line-strong text-faint",
};
const PAYMENT_COLORS: Record<string, string> = {
  PAID: "border-ok/50 text-ok",
  PENDING: "border-warn/50 text-warn",
  FAILED: "border-bad/50 text-bad",
  REFUNDED: "border-line-strong text-mute",
};

const base = "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium";

export function OrderStatusBadge({ status }: { status: string }) {
  return <span className={cn(base, ORDER_COLORS[status] ?? "border-line text-mute")}>{orderStatusLabel(status)}</span>;
}
export function PaymentBadge({ status }: { status: string }) {
  return <span className={cn(base, PAYMENT_COLORS[status] ?? "border-line text-mute")}>{paymentStatusLabel(status)}</span>;
}
