"use client";

import { useToast } from "@/components/ui/Toast";

export function CopyBlock({ text, mailto }: { text: string; mailto?: string }) {
  const toast = useToast();
  return (
    <div>
      <pre className="max-h-80 overflow-auto rounded-xl border border-line bg-ink p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-bone">{text}</pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast("Supplier details copied");
            } catch {
              toast("Couldn't copy — select the text and copy it manually", "error");
            }
          }}
        >
          Copy details
        </button>
        {mailto && (
          <a className="btn btn-ghost btn-sm" href={mailto}>
            Open in email
          </a>
        )}
      </div>
    </div>
  );
}
