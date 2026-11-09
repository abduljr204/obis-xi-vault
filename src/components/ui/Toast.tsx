"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6500 : 3800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-md animate-fade-up items-start gap-3 rounded-2xl border px-5 py-3.5 text-sm shadow-2xl shadow-black/60 backdrop-blur-md",
              t.kind === "success" && "border-ivory/25 bg-raise/95 text-ivory",
              t.kind === "error" && "border-bad/40 bg-[#1d0f0f]/95 text-[#ffd5d5]",
              t.kind === "info" && "border-line-strong bg-raise/95 text-bone",
            )}
          >
            <span aria-hidden className="mt-0.5">
              {t.kind === "success" ? "✦" : t.kind === "error" ? "!" : "i"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Shows a toast once from a server-provided flash message (e.g. ?saved=1). */
export function FlashToast({ message, kind = "success" }: { message?: string | null; kind?: ToastKind }) {
  const toast = useToast();
  useEffect(() => {
    if (message) toast(message, kind);
  }, [message, kind, toast]);
  return null;
}
