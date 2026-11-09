"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { ProductFormState } from "@/app/admin/(panel)/products/actions";
import { useToast } from "@/components/ui/Toast";
import { ALL_SIZES, SPORTS, SUGGESTED_COLLECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Initial = {
  name: string;
  collection: string;
  sport: string;
  price: string;
  description: string;
  sizes: string[];
  featured: boolean;
  active: boolean;
  images: { id: string; url: string }[];
};

const EMPTY: Initial = { name: "", collection: "", sport: "", price: "", description: "", sizes: ["S", "M", "L", "XL"], featured: false, active: true, images: [] };
const MAX_MB = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export function ProductForm({
  action,
  initial = EMPTY,
  currency,
  submitLabel,
  collections,
}: {
  action: (state: ProductFormState, fd: FormData) => Promise<ProductFormState>;
  initial?: Initial;
  currency: string;
  submitLabel: string;
  collections: string[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [cover, setCover] = useState(initial.images[0]?.id ?? "");
  const [sizes, setSizes] = useState<string[]>(initial.sizes);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state, toast]);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    const badType = files.find((f) => !ACCEPT.split(",").includes(f.type));
    if (tooBig || badType) {
      setFileError(tooBig ? `"${tooBig.name}" is larger than ${MAX_MB} MB.` : `"${badType!.name}" isn't a supported image type.`);
      e.target.value = "";
      setPreviews([]);
      return;
    }
    setFileError(null);
    setPreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
  }

  const allCollections = [...new Set([...SUGGESTED_COLLECTIONS, ...collections])];

  return (
    <form
      // Submitting manually (instead of action=) keeps typed values and chosen files if validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="grid gap-8 xl:grid-cols-[1fr_22rem]"
      noValidate
    >
      <div className="space-y-8">
        <section className="card space-y-6 p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <div>
            <label htmlFor="name" className="field-label">Product name</label>
            <input id="name" name="name" defaultValue={initial.name} required maxLength={120} className="input" aria-invalid={!!fe.name} placeholder="e.g. Vault Metro Home Jersey" />
            {fe.name && <p className="field-error">{fe.name}</p>}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="collection" className="field-label">Style / collection</label>
              <input id="collection" name="collection" list="collections" defaultValue={initial.collection} required maxLength={40} className="input" aria-invalid={!!fe.collection} placeholder="Metro, Classic, New…" />
              <datalist id="collections">
                {allCollections.map((c) => <option key={c} value={c} />)}
              </datalist>
              {fe.collection && <p className="field-error">{fe.collection}</p>}
            </div>
            <div>
              <label htmlFor="sport" className="field-label">Sport</label>
              <select id="sport" name="sport" defaultValue={initial.sport} required className="input" aria-invalid={!!fe.sport}>
                <option value="" disabled>Choose…</option>
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {fe.sport && <p className="field-error">{fe.sport}</p>}
            </div>
            <div>
              <label htmlFor="price" className="field-label">Price ({currency.toUpperCase()})</label>
              <input id="price" name="price" inputMode="decimal" defaultValue={initial.price} required className="input" aria-invalid={!!fe.price} placeholder="79.99" />
              {fe.price && <p className="field-error">{fe.price}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" name="description" defaultValue={initial.description} rows={6} maxLength={4000} required className="input" aria-invalid={!!fe.description} placeholder="Fabric, fit, story behind the kit…" />
            {fe.description && <p className="field-error">{fe.description}</p>}
          </div>
          <fieldset>
            <legend className="field-label">Available sizes</legend>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => {
                const on = sizes.includes(s);
                return (
                  <label key={s} className={cn("flex h-11 min-w-14 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm transition-colors", on ? "border-ivory bg-ivory text-ink" : "border-line-strong hover:border-ivory")}>
                    <input
                      type="checkbox"
                      name="sizes"
                      value={s}
                      checked={on}
                      onChange={() => setSizes((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                      className="sr-only"
                    />
                    {s}
                  </label>
                );
              })}
            </div>
            {fe.sizes && <p className="field-error">{fe.sizes}</p>}
          </fieldset>
        </section>

        <section className="card space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Photos</h2>
            <p className="text-xs text-faint">JPG, PNG, WebP · up to {MAX_MB} MB each · max 8</p>
          </div>

          {initial.images.length > 0 && (
            <div>
              <p className="mb-3 text-xs text-mute">Current photos. Choose the cover or mark photos to remove.</p>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {initial.images.map((img) => {
                  const isRemoved = removed.includes(img.id);
                  return (
                    <li key={img.id} className={cn("overflow-hidden rounded-xl border bg-panel transition-opacity", cover === img.id && !isRemoved ? "border-ivory" : "border-line", isRemoved && "opacity-35")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="aspect-[4/5] w-full object-cover" />
                      <div className="space-y-1.5 p-2 text-xs">
                        <label className="flex items-center gap-1.5">
                          <input type="radio" name="coverImage" value={img.id} checked={cover === img.id} onChange={() => setCover(img.id)} disabled={isRemoved} /> Cover
                        </label>
                        <label className="flex items-center gap-1.5 text-bad">
                          <input
                            type="checkbox"
                            name="removeImage"
                            value={img.id}
                            checked={isRemoved}
                            onChange={() => setRemoved((r) => (isRemoved ? r.filter((x) => x !== img.id) : [...r, img.id]))}
                          />
                          Remove
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="images"
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors hover:border-ivory",
                fe.images || fileError ? "border-bad" : "border-line-strong",
              )}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-mute" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
              <span className="text-sm">{initial.images.length ? "Add more photos" : "Upload product photos"}</span>
              <span className="text-xs text-faint">Click to choose files. The first one becomes the cover.</span>
            </label>
            <input ref={fileRef} id="images" name="images" type="file" accept={ACCEPT} multiple onChange={onFiles} className="sr-only" />
            {(fe.images || fileError) && <p className="field-error">{fileError ?? fe.images}</p>}
            {previews.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((p) => (
                  <li key={p.url} className="overflow-hidden rounded-xl border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="aspect-[4/5] w-full object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-12 xl:self-start">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Visibility</h2>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={initial.active} className="mt-1 h-4 w-4 accent-[#f3efe6]" />
            <span>
              <span className="block">Visible in store</span>
              <span className="text-xs text-faint">Untick to hide it without deleting.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="mt-1 h-4 w-4 accent-[#f3efe6]" />
            <span>
              <span className="block">Featured</span>
              <span className="text-xs text-faint">Shown first on the home page.</span>
            </span>
          </label>
        </section>
        {state.error && <p role="alert" className="rounded-xl border border-bad/40 bg-bad/5 px-4 py-3 text-sm text-bad">{state.error}</p>}
        <div className="flex gap-3">
          <Link href="/admin/products" className="btn btn-ghost flex-1">Cancel</Link>
          <button type="submit" className="btn btn-primary flex-1" disabled={pending || !!fileError}>
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </aside>
    </form>
  );
}
