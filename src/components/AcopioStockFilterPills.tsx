"use client";

import type { EstadoStock } from "@/types/database";

const STOCK_FILTER_OPTIONS: {
  id: EstadoStock;
  label: string;
}[] = [
  { id: "CRITICO", label: "🔴 Crítico" },
  { id: "MODERADO", label: "🟡 Moderado" },
  { id: "ABASTECIDO", label: "🟢 Abastecido" },
];

export function AcopioStockFilterPills({
  value,
  onChange,
  className = "",
}: {
  value: EstadoStock[];
  onChange: (value: EstadoStock[]) => void;
  className?: string;
}) {
  function handleToggle(stock: EstadoStock) {
    onChange(
      value.includes(stock)
        ? value.filter((item) => item !== stock)
        : [...value, stock],
    );
  }

  return (
    <div
      className={`mt-3 flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label="Filtrar por nivel de stock"
    >
      {STOCK_FILTER_OPTIONS.map((option) => {
        const active = value.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleToggle(option.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
