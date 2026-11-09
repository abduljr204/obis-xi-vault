"use client";

import { startTransition, useActionState, useEffect } from "react";
import type { OrderFormState } from "@/app/admin/(panel)/orders/actions";
import { useToast } from "@/components/ui/Toast";
import { ORDER_STATUSES } from "@/lib/constants";

type Props = {
  action: (s: OrderFormState, fd: FormData) => Promise<OrderFormState>;
  initial: { status: string; trackingNumber: string; carrier: string; adminNotes: string };
  paid: boolean;
};

export function OrderUpdateForm({ action, initial, paid }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) toast("Order updated");
    else if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-5"
      noValidate
    >
      <div>
        <label htmlFor="status" className="field-label">Order status</label>
        <select id="status" name="status" defaultValue={initial.status} className="input" aria-invalid={!!fe.status}>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value} disabled={!paid && ["SENT_TO_SUPPLIER", "SHIPPED", "COMPLETED"].includes(s.value)}>
              {s.label}
            </option>
          ))}
        </select>
        {fe.status && <p className="field-error">{fe.status}</p>}
        {!paid && <p className="mt-2 text-xs text-warn">Unpaid orders can only be New or Cancelled.</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className="field-label">Carrier</label>
          <input id="carrier" name="carrier" defaultValue={initial.carrier} maxLength={60} className="input" placeholder="DHL, UPS, Aramex…" />
        </div>
        <div>
          <label htmlFor="trackingNumber" className="field-label">Tracking number</label>
          <input id="trackingNumber" name="trackingNumber" defaultValue={initial.trackingNumber} maxLength={100} className="input" />
          {fe.trackingNumber && <p className="field-error">{fe.trackingNumber}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="adminNotes" className="field-label">Internal notes</label>
        <textarea id="adminNotes" name="adminNotes" defaultValue={initial.adminNotes} rows={3} maxLength={2000} className="input" placeholder="Supplier ref, dates, anything to remember… (not shown to customer)" />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
