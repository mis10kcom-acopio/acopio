"use client";

import { useEffect, useRef, useState } from "react";
import type { MascotaSortOrder } from "@/lib/mascota-sort";

export type { MascotaSortOrder };

const SORT_OPTIONS: { key: MascotaSortOrder; label: string }[] = [
  { key: "newest", label: "Más nuevo → más viejo" },
  { key: "oldest", label: "Más viejo → más nuevo" },
];

export function MascotaSortFilterPills({
  value,
  onChange,
  className = "",
}: {
  value: MascotaSortOrder;
  onChange: (value: MascotaSortOrder) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeOption =
    SORT_OPTIONS.find((option) => option.key === value) ?? SORT_OPTIONS[0]!;
  const isDefault = value === "newest";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(key: MascotaSortOrder) {
    onChange(key);
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onChange("newest");
    setOpen(false);
  }

  function handleToggleOpen() {
    setOpen((current) => !current);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!isDefault ? (
        <div
          className={`inline-flex max-w-full items-stretch overflow-hidden rounded-lg border-2 shadow-sm ${
            open ? "border-slate-600" : "border-slate-700"
          } bg-slate-700 text-white`}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={handleToggleOpen}
            className="inline-flex min-w-0 items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition hover:bg-slate-600 md:px-4 md:py-2 md:text-sm"
          >
            <span className="truncate">🕐 {activeOption.label}</span>
          </button>
          <button
            type="button"
            aria-label="Volver al orden por defecto"
            onClick={handleClear}
            className="shrink-0 border-l border-slate-500 px-2.5 py-1 text-sm leading-none transition hover:bg-slate-600 md:px-3 md:py-2"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={handleToggleOpen}
          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border-2 border-zinc-400 bg-[#F0EDE8] px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-zinc-500 hover:bg-[#E8E4DE] md:px-4 md:py-2 md:text-sm"
        >
          <span>🕐 Ordenar por fecha</span>
          <span
            className={`text-xs transition ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>
      )}

      {open ? (
        <div
          className="absolute left-0 z-50 mt-2 w-[min(100%,20rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:w-80"
          role="listbox"
          aria-label="Orden por fecha de publicación"
        >
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Orden
          </p>
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((option) => {
              const active = value === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(option.key)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? "border-slate-700 bg-slate-700 text-white shadow-sm"
                      : "border-slate-400 bg-white text-slate-700 hover:border-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
