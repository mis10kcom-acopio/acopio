"use client";

import {
  ESPECIE_FILTER_OPTIONS,
  type EspecieFilterId,
} from "@/lib/mascota-especie";

export function EspecieFilterPills({
  value,
  onChange,
  className = "mt-3",
}: {
  value: EspecieFilterId | null;
  onChange: (value: EspecieFilterId | null) => void;
  className?: string;
}) {
  function handleToggle(filterId: EspecieFilterId) {
    onChange(value === filterId ? null : filterId);
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label="Filtrar por especie"
    >
      {ESPECIE_FILTER_OPTIONS.map((option) => {
        const active = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleToggle(option.id)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition md:px-4 md:py-2 md:text-sm ${
              active
                ? "border-amber-600 bg-amber-600 text-white shadow-sm"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
