import Link from "next/link";
import { cn } from "@/lib/utils";

/** The crown from the logo, as a crisp vector. */
export function Crown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 62" className={className} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M2 8 L27 30 L50 0 L73 30 L98 8 L87 45 Q50 38 13 45 Z M50 15 L56 24 L50 33 L44 24 Z"
      />
      <path d="M13 51 Q50 43 87 51 L86 58 Q50 50 14 58 Z" />
    </svg>
  );
}

/** Four-point sparkle used across the brand. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0C12.9 8 16 11.1 24 12 16 12.9 12.9 16 12 24 11.1 16 8 12.9 0 12 8 11.1 11.1 8 12 0Z" />
    </svg>
  );
}

/** Header wordmark: crown + OBI'S XI VAULT */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="Obi's XI Vault home">
      <span className="relative flex h-9 w-9 shrink-0 flex-col items-center justify-end">
        <Crown className="h-4 w-7 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5" />
        <span className="font-display text-[0.95rem] leading-none font-bold tracking-tight">OXI</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-[0.06em] sm:text-xl">OBI&rsquo;S XI VAULT</span>
          <span className="mt-1 hidden text-[0.52rem] tracking-[0.34em] text-mute sm:block">FOOTBALL · BASKETBALL · CLASSICS</span>
        </span>
      )}
    </Link>
  );
}
