"use client";

import { useMemo } from "react";
import {
  DEFAULT_WHATSAPP_DIAL_CODE,
  parseStoredWhatsapp,
  WHATSAPP_COUNTRY_OPTIONS,
} from "@/lib/whatsapp-phone";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

const labelClassName = "block text-sm font-medium text-zinc-700";

export const WHATSAPP_FIELD_HINT =
  "Ingresa solo el número móvil, sin el código de país (7 a 15 dígitos).";

export function WhatsappField({
  defaultStoredValue = "",
  hint = WHATSAPP_FIELD_HINT,
}: {
  defaultStoredValue?: string;
  hint?: string;
}) {
  const { dialCode, number } = useMemo(
    () => parseStoredWhatsapp(defaultStoredValue),
    [defaultStoredValue],
  );

  function handleNumberInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    input.value = input.value.replace(/\D/g, "").slice(0, 15);
  }

  return (
    <div>
      <label htmlFor="contacto_whatsapp_numero" className={labelClassName}>
        Número de WhatsApp
        <span className="text-red-500"> *</span>
      </label>
      <div className="mt-1 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-stretch gap-2">
        <select
          id="contacto_whatsapp_codigo"
          name="contacto_whatsapp_codigo"
          required
          defaultValue={dialCode || DEFAULT_WHATSAPP_DIAL_CODE}
          className={`${inputClassName} min-w-0 text-sm sm:text-base`}
          aria-label="Código de país de WhatsApp"
        >
          {WHATSAPP_COUNTRY_OPTIONS.map((option) => (
            <option
              key={`${option.dialCode}-${option.label}`}
              value={option.dialCode}
            >
              {option.flag} {option.dialCode} {option.label}
            </option>
          ))}
        </select>
        <input
          id="contacto_whatsapp_numero"
          name="contacto_whatsapp_numero"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          defaultValue={number}
          placeholder="4141234567"
          pattern="[0-9]{7,15}"
          minLength={7}
          maxLength={15}
          onInput={handleNumberInput}
          className={`${inputClassName} min-w-0`}
        />
      </div>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
