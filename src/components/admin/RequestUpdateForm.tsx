"use client";

import { startTransition, useActionState, useEffect } from "react";
import type { RequestUpdateState } from "@/app/admin/(panel)/requests/actions";
import { useToast } from "@/components/ui/Toast";
import { REQUEST_STATUSES } from "@/lib/constants";

type Props = {
  action: (s: RequestUpdateState, fd: FormData) => Promise<RequestUpdateState>;
  initial: { status: string; adminNotes: string };
};

export function RequestUpdateForm({ action, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) toast("Request updated");
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
        <label htmlFor="status" className="field-label">Status</label>
        <select id="status" name="status" defaultValue={initial.status} className="input" aria-invalid={!!fe.status}>
          {REQUEST_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {fe.status && <p className="field-error">{fe.status}</p>}
      </div>
      <div>
        <label htmlFor="adminNotes" className="field-label">Internal notes</label>
        <textarea id="adminNotes" name="adminNotes" defaultValue={initial.adminNotes} rows={4} maxLength={2000} className="input" aria-invalid={!!fe.adminNotes} placeholder="Supplier, price quoted, follow-up date… (not shown to customer)" />
        {fe.adminNotes && <p className="field-error">{fe.adminNotes}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
