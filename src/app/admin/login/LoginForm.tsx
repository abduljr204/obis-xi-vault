"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      {state.error && (
        <p role="alert" className="rounded-xl border border-bad/40 bg-bad/5 px-4 py-3 text-sm text-bad">{state.error}</p>
      )}
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className="input" aria-invalid={!!state.fieldErrors?.email} />
        {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" aria-invalid={!!state.fieldErrors?.password} />
        {state.fieldErrors?.password && <p className="field-error">{state.fieldErrors.password}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
