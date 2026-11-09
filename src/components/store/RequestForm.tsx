"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import type { RequestFormState } from "@/app/(store)/request/actions";
import { useToast } from "@/components/ui/Toast";
import { ALL_SIZES, MAX_REQUEST_QTY, SPORTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { jerseyRequestSchema, REQUEST_FIELDS, toFieldErrors, type FieldErrors } from "@/lib/validation";

type Field = (typeof REQUEST_FIELDS)[number];
type Props = {
  action: (s: RequestFormState, fd: FormData) => Promise<RequestFormState>;
  defaults: { sport?: string; team?: string };
};

function Label({ name, children, optional }: { name: Field; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={name} className="field-label">
      {children} {optional && <span className="tracking-normal text-faint normal-case">(optional)</span>}
    </label>
  );
}

function FieldError({ name, error }: { name: Field; error?: string }) {
  return error ? <p id={`${name}-error`} className="field-error">{error}</p> : null;
}

const aria = (name: Field, error?: string) => ({
  id: name,
  name,
  "aria-invalid": !!error,
  "aria-describedby": error ? `${name}-error` : undefined,
});

export function RequestForm({ action, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const toast = useToast();
  const fe = { ...state.fieldErrors, ...clientErrors };

  useEffect(() => {
    if (state.error) toast(state.error, "error");
    if (state.fieldErrors) {
      const first = REQUEST_FIELDS.find((f) => state.fieldErrors?.[f]);
      if (first) document.getElementById(first)?.focus();
    }
  }, [state, toast]);

  if (state.requestNumber) {
    return (
      <div className="card px-6 py-14 text-center sm:px-12">
        <p className="eyebrow">Request received</p>
        <h2 className="font-display mt-3 text-3xl font-bold">We&rsquo;re on the hunt</h2>
        {state.requestNumber !== "REQ-RECEIVED" && (
          <p className="mt-4 text-sm text-mute">
            Your reference number is <span className="font-display text-ivory">{state.requestNumber}</span>.
          </p>
        )}
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mute">
          We&rsquo;ll check with our suppliers and email you with availability and a price, usually within 2–3 working days.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">Keep shopping</Link>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-ghost">Send another request</button>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Check in the browser first for instant feedback; the server checks again.
    const parsed = jerseyRequestSchema.safeParse(Object.fromEntries(REQUEST_FIELDS.map((f) => [f, String(fd.get(f) ?? "")])));
    if (!parsed.success) {
      const errs = toFieldErrors(parsed.error);
      setClientErrors(errs);
      const first = REQUEST_FIELDS.find((f) => errs[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setClientErrors({});
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-10 p-6 sm:p-10">
      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-6">
        <legend className="font-display mb-6 text-xl font-semibold">The jersey</legend>

        <div>
          <span className="field-label" id="sport-label">Sport</span>
          <div role="radiogroup" aria-labelledby="sport-label" className="grid grid-cols-2 gap-3">
            {SPORTS.map((s, i) => (
              <label
                key={s.value}
                className="cursor-pointer rounded-xl border border-line px-4 py-3 text-center text-sm transition-colors hover:border-ivory has-[:checked]:border-ivory has-[:checked]:bg-ivory has-[:checked]:text-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ivory/60"
              >
                <input
                  type="radio"
                  name="sport"
                  value={s.value}
                  id={i === 0 ? "sport" : undefined}
                  defaultChecked={defaults.sport ? defaults.sport === s.value : i === 0}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>
          <FieldError name="sport" error={fe.sport} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label name="team">Team or national side</Label>
            <input {...aria("team", fe.team)} defaultValue={defaults.team} maxLength={100} className="input" placeholder="e.g. AC Milan, Golden State Warriors" />
            <FieldError name="team" error={fe.team} />
          </div>
          <div>
            <Label name="season" optional>Season / version</Label>
            <input {...aria("season", fe.season)} maxLength={80} className="input" placeholder="e.g. 2024/25 Away, 1998 retro" />
            <FieldError name="season" error={fe.season} />
          </div>
          <div>
            <Label name="player" optional>Name &amp; number on the back</Label>
            <input {...aria("player", fe.player)} maxLength={80} className="input" placeholder="e.g. Maldini 3, or blank" />
            <FieldError name="player" error={fe.player} />
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <div>
              <Label name="size">Size</Label>
              <select {...aria("size", fe.size)} defaultValue="" className="input">
                <option value="" disabled>Choose…</option>
                {ALL_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError name="size" error={fe.size} />
            </div>
            <div>
              <Label name="quantity">Qty</Label>
              <input {...aria("quantity", fe.quantity)} type="number" inputMode="numeric" min={1} max={MAX_REQUEST_QTY} defaultValue={1} className="input" />
              <FieldError name="quantity" error={fe.quantity} />
            </div>
          </div>
          <div>
            <Label name="budget" optional>Budget</Label>
            <input {...aria("budget", fe.budget)} maxLength={60} className="input" placeholder="e.g. up to $120" />
            <FieldError name="budget" error={fe.budget} />
          </div>
          <div>
            <Label name="referenceUrl" optional>Link to a photo of it</Label>
            <input {...aria("referenceUrl", fe.referenceUrl)} type="url" inputMode="url" maxLength={500} className="input" placeholder="https://…" />
            <FieldError name="referenceUrl" error={fe.referenceUrl} />
          </div>
        </div>

        <div>
          <Label name="notes" optional>Anything else we should know?</Label>
          <textarea {...aria("notes", fe.notes)} rows={4} maxLength={1000} className="input" placeholder="Player or fan version, long sleeves, patches, how soon you need it…" />
          <FieldError name="notes" error={fe.notes} />
        </div>
      </fieldset>

      <hr className="border-line" />

      <fieldset className="space-y-6">
        <legend className="font-display mb-6 text-xl font-semibold">How we reach you</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label name="name">Your name</Label>
            <input {...aria("name", fe.name)} autoComplete="name" maxLength={100} className="input" />
            <FieldError name="name" error={fe.name} />
          </div>
          <div>
            <Label name="email">Email</Label>
            <input {...aria("email", fe.email)} type="email" autoComplete="email" maxLength={200} className="input" />
            <FieldError name="email" error={fe.email} />
          </div>
          <div>
            <Label name="phone" optional>Phone / WhatsApp</Label>
            <input {...aria("phone", fe.phone)} type="tel" autoComplete="tel" maxLength={20} className="input" />
            <FieldError name="phone" error={fe.phone} />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-faint">
          Sending a request is free and doesn&rsquo;t commit you to anything. We only use your details to reply about this jersey.
        </p>
        <button type="submit" disabled={pending} className={cn("btn btn-primary", pending && "opacity-70")}>
          {pending ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
