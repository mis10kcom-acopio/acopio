"use client";

import { useState } from "react";
import {
  ESPECIE_FORM_OPTIONS,
  normalizeEspecie,
  type EspecieMascota,
} from "@/lib/mascota-especie";

export function EspecieField({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const [selected, setSelected] = useState<EspecieMascota | null>(() =>
    normalizeEspecie(defaultValue),
  );

  return (
    <div>
      <span className="block text-sm font-medium text-zinc-700">Especie</span>
      <p className="mt-1 text-xs text-zinc-500">Opcional</p>
      <input type="hidden" name="especie" value={selected ?? ""} />
      <div
        className="mt-2 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Especie de la mascota"
      >
        {ESPECIE_FORM_OPTIONS.map((option) => {
          const active = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
                setSelected(active ? null : option.value)
              }
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              <span aria-hidden>{option.emoji} </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
