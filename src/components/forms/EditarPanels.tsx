"use client";

import { useState, useTransition } from "react";
import {
  actualizarStockAcopio,
  marcarMascotaResuelta,
  marcarVoluntarioNoDisponible,
} from "@/actions/editar";
import { FormError, FormSuccess } from "@/components/forms/FormFields";
import type {
  AcopioMascota,
  EstadoStock,
  MascotaReportada,
  RedVoluntario,
} from "@/types/database";

function ActionButton({
  label,
  onClick,
  variant = "primary",
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "danger" | "warning" | "success";
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl px-4 py-4 text-base font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
    >
      {label}
    </button>
  );
}

export function EditarMascotaPanel({
  token,
  registro,
  successMessage,
}: {
  token: string;
  registro: MascotaReportada;
  successMessage: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const yaResuelto = registro.estado === "RESUELTO";

  function handleResolver() {
    setError(null);
    startTransition(async () => {
      const result = await marcarMascotaResuelta(token);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <FormSuccess message={successMessage} />
      <FormError message={error} />

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <p>
          <span className="font-medium">Reporte:</span>{" "}
          {registro.tipo_reporte === "PERDIDO" ? "Perdido" : "Encontrado"} —{" "}
          {registro.especie}
          {registro.nombre_mascota ? ` (${registro.nombre_mascota})` : ""}
        </p>
        <p className="mt-1">
          <span className="font-medium">Zona:</span> {registro.ubicacion_zona}
        </p>
        <p className="mt-1">
          <span className="font-medium">Estado actual:</span>{" "}
          {yaResuelto ? "Resuelto" : "Activo"}
        </p>
      </div>

      {!yaResuelto ? (
        <ActionButton
          label={pending ? "Actualizando…" : "Marcar como resuelto (encontrado/reunido)"}
          onClick={handleResolver}
          variant="success"
          disabled={pending}
        />
      ) : (
        <p className="text-center text-sm text-emerald-700">
          Este caso ya está marcado como resuelto.
        </p>
      )}
    </div>
  );
}

export function EditarVoluntarioPanel({
  token,
  registro,
  successMessage,
}: {
  token: string;
  registro: RedVoluntario;
  successMessage: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const noDisponible = registro.disponibilidad === "LLENO/NO_DISPONIBLE";

  function handleNoDisponible() {
    setError(null);
    startTransition(async () => {
      const result = await marcarVoluntarioNoDisponible(token);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <FormSuccess message={successMessage} />
      <FormError message={error} />

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <p>
          <span className="font-medium">Voluntario:</span> {registro.nombre_o_clinica}
        </p>
        <p className="mt-1">
          <span className="font-medium">Zona:</span> {registro.ubicacion_zona}
        </p>
        <p className="mt-1">
          <span className="font-medium">Disponibilidad:</span>{" "}
          {noDisponible ? "Lleno / No disponible" : "Disponible"}
        </p>
      </div>

      {!noDisponible ? (
        <ActionButton
          label={
            pending
              ? "Actualizando…"
              : "Marcar como lleno / no disponible"
          }
          onClick={handleNoDisponible}
          variant="warning"
          disabled={pending}
        />
      ) : (
        <p className="text-center text-sm text-amber-700">
          Ya estás marcado como no disponible en el listado público.
        </p>
      )}
    </div>
  );
}

const STOCK_OPTIONS: {
  value: EstadoStock;
  label: string;
  variant: "danger" | "warning" | "success";
}[] = [
  { value: "CRITICO", label: "Crítico", variant: "danger" },
  { value: "MODERADO", label: "Moderado", variant: "warning" },
  { value: "ABASTECIDO", label: "Abastecido", variant: "success" },
];

export function EditarAcopioPanel({
  token,
  registro,
  successMessage,
}: {
  token: string;
  registro: AcopioMascota;
  successMessage: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStock(estado: EstadoStock) {
    setError(null);
    startTransition(async () => {
      const result = await actualizarStockAcopio(token, estado);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const stockLabels: Record<EstadoStock, string> = {
    CRITICO: "Crítico",
    MODERADO: "Moderado",
    ABASTECIDO: "Abastecido",
  };

  return (
    <div className="space-y-5">
      <FormSuccess message={successMessage} />
      <FormError message={error} />

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <p>
          <span className="font-medium">Centro:</span> {registro.nombre_centro}
        </p>
        <p className="mt-1">
          <span className="font-medium">Zona:</span> {registro.ubicacion_zona}
        </p>
        <p className="mt-1">
          <span className="font-medium">Stock actual:</span>{" "}
          {stockLabels[registro.estado_stock]}
        </p>
      </div>

      <p className="text-center text-sm font-medium text-zinc-600">
        Actualizar nivel de stock
      </p>

      <div className="grid gap-3">
        {STOCK_OPTIONS.map((option) => (
          <ActionButton
            key={option.value}
            label={
              pending && registro.estado_stock !== option.value
                ? "Actualizando…"
                : option.label
            }
            onClick={() => handleStock(option.value)}
            variant={option.variant}
            disabled={pending || registro.estado_stock === option.value}
          />
        ))}
      </div>
    </div>
  );
}
