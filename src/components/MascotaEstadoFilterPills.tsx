"use client";

import type { EstadoMascota } from "@/types/database";

export type MascotaEstadoFilterId = Extract<
  EstadoMascota,
  "PERDIDO" | "EN_RESGUARDO"
>;

const ESTADO_FILTER_OPTIONS: {
  id: MascotaEstadoFilterId;
  label: string;
}[] = [
  { id: "PERDIDO", label: "Perdidas" },
  { id: "EN_RESGUARDO", label: "En Resguardo" },
];

export function MascotaEstadoFilterPills({
  value,
  onChange,
  className = "",
}: {
  value: MascotaEstadoFilterId | null;
  onChange: (value: MascotaEstadoFilterId | null) => void;
  className?: string;
}) {
  function handleToggle(filterId: MascotaEstadoFilterId) {
    onChange(value === filterId ? null : filterId);
  }

  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label="Filtrar por estado"
    >
      {ESTADO_FILTER_OPTIONS.map((option) => {
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
