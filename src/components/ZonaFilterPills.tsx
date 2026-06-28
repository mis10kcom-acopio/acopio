"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_ZONAS_VISIBLES,
  type ZonaFilterOption,
} from "@/lib/mascota-zona";

export function ZonaFilterPills({
  options,
  value,
  onChange,
  className = "",
}: {
  options: ZonaFilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = options.find((option) => option.key === value) ?? null;

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

  if (options.length === 0) {
    return null;
  }

  const hasHiddenOptions = options.length > MAX_ZONAS_VISIBLES;
  const visibleOptions =
    expanded || !hasHiddenOptions
      ? options
      : options.slice(0, MAX_ZONAS_VISIBLES);

  function handleSelect(key: string) {
    onChange(value === key ? null : key);
    setOpen(false);
  }

  function handleClear(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onChange(null);
    setOpen(false);
  }

  function handleToggleOpen() {
    setOpen((current) => !current);
    if (open) {
      setExpanded(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {activeOption ? (
        <div
          className={`inline-flex max-w-full items-stretch overflow-hidden rounded-full border shadow-sm ${
            open ? "border-slate-600" : "border-slate-700"
          } bg-slate-700 text-white`}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={handleToggleOpen}
            className="inline-flex min-w-0 items-center gap-1.5 px-4 py-2 text-sm font-semibold transition hover:bg-slate-600"
          >
            <span className="truncate">📍 {activeOption.label}</span>
          </button>
          <button
            type="button"
            aria-label="Quitar filtro de zona"
            onClick={handleClear}
            className="shrink-0 border-l border-slate-500 px-3 py-2 text-base leading-none transition hover:bg-slate-600"
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
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-600 hover:bg-slate-50"
        >
          <span>📍 Filtrar por Zona</span>
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
          aria-label="Zonas frecuentes"
        >
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Zonas frecuentes
          </p>
          <div className="max-h-[min(14rem,45vh)] overflow-y-auto overscroll-contain pr-1">
            <div className="flex flex-wrap gap-2">
              {visibleOptions.map((option) => {
                const active = value === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(option.key)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      active
                        ? "border-slate-700 bg-slate-700 text-white shadow-sm"
                        : "border-slate-400 bg-white text-slate-700 hover:border-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                    <span
                      className={active ? "text-slate-200" : "text-slate-500"}
                    >
                      {" "}
                      ({option.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {hasHiddenOptions ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-3 w-full rounded-full border border-dashed border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-600 hover:bg-slate-50"
            >
              {expanded ? "Ver menos zonas" : "Ver más zonas..."}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
