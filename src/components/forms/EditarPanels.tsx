"use client";

import { useActionState, useState, useTransition } from "react";
import {
  actualizarAcopio,
  actualizarMascota,
  actualizarStockAcopio,
  actualizarVoluntario,
  cambiarMascotaAEncontrada,
  marcarMascotaResuelta,
  marcarVoluntarioDisponible,
  marcarVoluntarioNoDisponible,
} from "@/actions/editar";
import {
  ActionForm,
  FormError,
  FormField,
  FormSuccess,
  SubmitButton,
} from "@/components/forms/FormFields";
import { initialActionState } from "@/types/actions";
import type {
  AcopioMascota,
  EstadoStock,
  MascotaReportada,
  RedVoluntario,
} from "@/types/database";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold uppercase tracking-wide text-zinc-500">
      {children}
    </h3>
  );
}

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
  identificador,
  registro,
  successMessage,
}: {
  identificador: string;
  registro: MascotaReportada;
  successMessage: string | null;
}) {
  const updateAction = actualizarMascota.bind(null, identificador);
  const [formState, formAction] = useActionState(updateAction, initialActionState);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const yaResuelto = registro.estado === "RESUELTO";
  const esPerdido = registro.tipo_reporte === "PERDIDO";

  function handleCambiarAEncontrado() {
    setStatusError(null);
    startTransition(async () => {
      const result = await cambiarMascotaAEncontrada(identificador);
      if (result?.error) setStatusError(result.error);
    });
  }

  function handleQuitarDelListado() {
    setStatusError(null);
    startTransition(async () => {
      const result = await marcarMascotaResuelta(identificador);
      if (result?.error) setStatusError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      <FormSuccess message={successMessage} />
      <FormError message={formState.error ?? statusError} />

      <section className="space-y-4">
        <SectionTitle>Editar datos del reporte</SectionTitle>
        <ActionForm action={formAction}>
          <FormField
            label="Tipo de reporte"
            name="tipo_reporte"
            as="select"
            required
            defaultValue={registro.tipo_reporte}
          >
            <option value="PERDIDO">Perdido</option>
            <option value="ENCONTRADO">Encontrado</option>
          </FormField>

          <FormField
            label="Especie"
            name="especie"
            required
            defaultValue={registro.especie}
          />

          <FormField
            label="Nombre de la mascota"
            name="nombre_mascota"
            defaultValue={registro.nombre_mascota ?? ""}
            placeholder="Opcional"
          />

          <FormField
            label="Características"
            name="caracteristicas"
            as="textarea"
            required
            defaultValue={registro.caracteristicas}
          />

          <FormField
            label="Zona / Municipio"
            name="ubicacion_zona"
            required
            defaultValue={registro.ubicacion_zona}
          />

          <FormField
            label="Teléfono de contacto"
            name="contacto_telefono"
            type="tel"
            required
            defaultValue={registro.contacto_telefono}
          />

          <FormField
            label="Número de WhatsApp (Opcional)"
            name="contacto_whatsapp"
            type="tel"
            defaultValue={registro.contacto_whatsapp ?? ""}
            placeholder="Ej: +584141234567"
          />

          <SubmitButton>Guardar cambios</SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6">
        <SectionTitle>Acciones rápidas</SectionTitle>
        <p className="text-sm text-zinc-600">
          Estado en listado:{" "}
          <span className="font-semibold text-zinc-900">
            {yaResuelto ? "Oculto (resuelto)" : "Visible (activo)"}
          </span>
        </p>

        {!yaResuelto ? (
          <div className="grid gap-3">
            {esPerdido && (
              <ActionButton
                label={pending ? "Actualizando…" : "Marcar como ENCONTRADO"}
                onClick={handleCambiarAEncontrado}
                variant="success"
                disabled={pending}
              />
            )}
            <ActionButton
              label={
                pending
                  ? "Actualizando…"
                  : "Quitar del listado público (ya no es necesario)"
              }
              onClick={handleQuitarDelListado}
              variant="warning"
              disabled={pending}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-emerald-700">
            Este reporte ya fue retirado del listado público.
          </p>
        )}
      </section>
    </div>
  );
}

const TIPO_VOLUNTARIO_LABELS: Record<RedVoluntario["tipo_ayuda"], string> = {
  VETERINARIO: "Veterinario / Clínica",
  HOGAR_TEMPORAL: "Hogar temporal",
  RESCATISTA: "Rescatista",
  TRANSPORTE: "Transporte",
};

export function EditarVoluntarioPanel({
  identificador,
  registro,
  successMessage,
}: {
  identificador: string;
  registro: RedVoluntario;
  successMessage: string | null;
}) {
  const updateAction = actualizarVoluntario.bind(null, identificador);
  const [formState, formAction] = useActionState(updateAction, initialActionState);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const noDisponible = registro.disponibilidad === "LLENO/NO_DISPONIBLE";
  const esVeterinario = registro.tipo_ayuda === "VETERINARIO";

  function handleNoDisponible() {
    setStatusError(null);
    startTransition(async () => {
      const result = await marcarVoluntarioNoDisponible(identificador);
      if (result?.error) setStatusError(result.error);
    });
  }

  function handleDisponible() {
    setStatusError(null);
    startTransition(async () => {
      const result = await marcarVoluntarioDisponible(identificador);
      if (result?.error) setStatusError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      <FormSuccess message={successMessage} />
      <FormError message={formState.error ?? statusError} />

      <section className="space-y-4">
        <SectionTitle>Editar datos de contacto</SectionTitle>
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          Tipo de registro:{" "}
          <span className="font-semibold">
            {TIPO_VOLUNTARIO_LABELS[registro.tipo_ayuda]}
          </span>
        </p>

        <ActionForm action={formAction}>
          <FormField
            label={
              esVeterinario
                ? "Nombre de la Clínica o Veterinario"
                : "Nombre y Apellido"
            }
            name="nombre_o_clinica"
            required
            defaultValue={registro.nombre_o_clinica}
          />

          <FormField
            label="Zona / Municipio"
            name="ubicacion_zona"
            required
            defaultValue={registro.ubicacion_zona}
          />

          <FormField
            label="Teléfono de contacto"
            name="contacto_telefono"
            type="tel"
            required
            defaultValue={registro.contacto_telefono}
          />

          <FormField
            label="Número de WhatsApp (Opcional)"
            name="contacto_whatsapp"
            type="tel"
            defaultValue={registro.contacto_whatsapp ?? ""}
            placeholder="Ej: +584141234567"
          />

          <SubmitButton>Guardar cambios</SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6">
        <SectionTitle>Disponibilidad</SectionTitle>
        {!noDisponible ? (
          <ActionButton
            label={
              pending ? "Actualizando…" : "Marcar como lleno / no disponible"
            }
            onClick={handleNoDisponible}
            variant="warning"
            disabled={pending}
          />
        ) : (
          <ActionButton
            label={
              pending ? "Actualizando…" : "Volver a marcar como Disponible"
            }
            onClick={handleDisponible}
            variant="success"
            disabled={pending}
          />
        )}
      </section>
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
  identificador,
  registro,
  successMessage,
}: {
  identificador: string;
  registro: AcopioMascota;
  successMessage: string | null;
}) {
  const updateAction = actualizarAcopio.bind(null, identificador);
  const [formState, formAction] = useActionState(updateAction, initialActionState);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStock(estado: EstadoStock) {
    setStatusError(null);
    startTransition(async () => {
      const result = await actualizarStockAcopio(identificador, estado);
      if (result?.error) setStatusError(result.error);
    });
  }

  const stockLabels: Record<EstadoStock, string> = {
    CRITICO: "Crítico",
    MODERADO: "Moderado",
    ABASTECIDO: "Abastecido",
  };

  return (
    <div className="space-y-8">
      <FormSuccess message={successMessage} />
      <FormError message={formState.error ?? statusError} />

      <section className="space-y-4">
        <SectionTitle>Editar datos del centro</SectionTitle>
        <ActionForm action={formAction}>
          <FormField
            label="Nombre del centro"
            name="nombre_centro"
            required
            defaultValue={registro.nombre_centro}
          />

          <FormField
            label="Zona / Municipio"
            name="ubicacion_zona"
            required
            defaultValue={registro.ubicacion_zona}
          />

          <FormField
            label="Dirección exacta"
            name="direccion_exacta"
            required
            defaultValue={registro.direccion_exacta}
          />

          <FormField
            label="Teléfono de contacto"
            name="contacto_telefono"
            type="tel"
            required
            defaultValue={registro.contacto_telefono}
          />

          <FormField
            label="Número de WhatsApp (Opcional)"
            name="contacto_whatsapp"
            type="tel"
            defaultValue={registro.contacto_whatsapp ?? ""}
            placeholder="Ej: +584141234567"
          />

          <FormField
            label="Necesidades urgentes"
            name="necesidades_urgentes"
            as="textarea"
            required
            defaultValue={registro.necesidades_urgentes}
          />

          <SubmitButton>Guardar cambios</SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6">
        <SectionTitle>Nivel de stock</SectionTitle>
        <p className="text-sm text-zinc-600">
          Stock actual:{" "}
          <span className="font-semibold text-zinc-900">
            {stockLabels[registro.estado_stock]}
          </span>
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
      </section>
    </div>
  );
}
