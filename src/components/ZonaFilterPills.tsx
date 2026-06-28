"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);

  if (options.length === 0) {
    return null;
  }

  const hasHiddenOptions = options.length > MAX_ZONAS_VISIBLES;
  const visibleOptions =
    expanded || !hasHiddenOptions
      ? options
      : options.slice(0, MAX_ZONAS_VISIBLES);

  function handleToggle(key: string) {
    onChange(value === key ? null : key);
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Zonas frecuentes
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por zona"
      >
        {visibleOptions.map((option) => {
          const active = value === option.key;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => handleToggle(option.key)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-slate-700 bg-slate-700 text-white shadow-sm"
                  : "border-slate-400 bg-white text-slate-700 hover:border-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
              <span className={active ? "text-slate-200" : "text-slate-500"}>
                {" "}
                ({option.count})
              </span>
            </button>
          );
        })}

        {hasHiddenOptions ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="rounded-full border border-dashed border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-600 hover:bg-slate-50"
          >
            {expanded ? "Ver menos zonas" : "Ver más zonas..."}
          </button>
        ) : null}
      </div>
    </div>
  );
}
