"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registrarAcopio, registrarMascota } from "@/actions/registro";
import { ExitoLinkActions } from "@/components/ExitoLinkActions";
import {
  ActionForm,
  FormError,
  FormField,
  FormFileField,
  FormSuccess,
  SubmitButton,
} from "@/components/forms/FormFields";
import { initialActionState } from "@/types/actions";

export function MascotaRegistroForm() {
  const [state, formAction] = useActionState(
    registrarMascota,
    initialActionState,
  );

  if (state.success && state.editUrl) {
    return (
      <div className="space-y-6">
        <FormSuccess message={state.success} />
        <p className="text-center text-base text-zinc-600">
          Tu publicación ya está en el listado. Guarda el enlace de abajo antes
          de salir de esta pantalla.
        </p>
        <ExitoLinkActions
          editUrl={state.editUrl}
          telefono={state.telefono ?? null}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={state.editUrl}
            className="flex-1 rounded-xl bg-amber-600 px-4 py-3.5 text-center text-base font-semibold text-white transition hover:bg-amber-700"
          >
            Ir a mi panel de edición
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-center text-base font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Ver listado público
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ActionForm action={formAction} encType="multipart/form-data">
      <FormError message={state.error} />

      <FormField label="Estado del reporte" name="estado" as="select" required>
        <option value="" disabled hidden>
          Selecciona…
        </option>
        <option value="PERDIDO">Perdido</option>
        <option value="EN_RESGUARDO">En Resguardo</option>
        <option value="EN_CASA">En Casa</option>
        <option value="ADOPCION">Adopción</option>
      </FormField>

      <FormField
        label="Nombre de la mascota"
        name="nombre_mascota"
        placeholder="Opcional"
      />

      <FormField
        label="Características"
        name="caracteristicas"
        as="textarea"
        required
        placeholder="Color, tamaño, collar, señas particulares…"
      />

      <FormField
        label="Zona / Municipio"
        name="ubicacion_zona"
        required
        placeholder="Ej: Chacao, Los Teques, Maracaibo…"
      />

      <FormField
        label="Teléfono de contacto"
        name="contacto_telefono"
        type="tel"
        required
        placeholder="04141234567"
        hint="Para llamadas y SMS. Obligatorio."
      />

      <FormField
        label="Número de WhatsApp (Opcional)"
        name="contacto_whatsapp"
        type="tel"
        placeholder="Ej: +584141234567"
        hint="Si es distinto al teléfono de llamadas. El botón de WhatsApp solo aparece si lo indicas."
      />

      <FormFileField
        label="Foto de la mascota"
        name="foto"
        accept="image/*"
        hint="Opcional. Toma una foto con la cámara o elige una de tu galería."
      />

      <SubmitButton pendingLabel="Subiendo foto y publicando…">
        Publicar reporte
      </SubmitButton>
    </ActionForm>
  );
}

export function AcopioRegistroForm() {
  const [state, formAction] = useActionState(registrarAcopio, initialActionState);

  return (
    <ActionForm action={formAction}>
      <FormError message={state.error} />

      <FormField
        label="Nombre del centro"
        name="nombre_centro"
        required
        placeholder="Ej: Acopio Parroquia San José"
      />

      <FormField
        label="Zona / Municipio"
        name="ubicacion_zona"
        required
        placeholder="Ej: Valencia, Mérida…"
      />

      <FormField
        label="Dirección exacta"
        name="direccion_exacta"
        required
        placeholder="Calle, referencia, punto de encuentro…"
      />

      <FormField
        label="Teléfono de contacto"
        name="contacto_telefono"
        type="tel"
        required
        placeholder="04141234567"
        hint="Para llamadas y SMS. Obligatorio."
      />

      <FormField
        label="Número de WhatsApp (Opcional)"
        name="contacto_whatsapp"
        type="tel"
        placeholder="Ej: +584141234567"
        hint="Si es distinto al teléfono de llamadas."
      />

      <FormField
        label="Necesidades urgentes"
        name="necesidades_urgentes"
        as="textarea"
        required
        placeholder="Alimento, medicinas, transporte, voluntarios…"
      />

      <SubmitButton>Registrar centro de acopio</SubmitButton>
    </ActionForm>
  );
}
