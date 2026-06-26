"use client";

import { useActionState } from "react";
import {
  registrarAcopio,
  registrarMascota,
  registrarVoluntario,
} from "@/actions/registro";
import {
  ActionForm,
  FormError,
  FormField,
  FormFileField,
  SubmitButton,
} from "@/components/forms/FormFields";
import { initialActionState } from "@/types/actions";

export function MascotaRegistroForm() {
  const [state, formAction] = useActionState(registrarMascota, initialActionState);

  return (
    <ActionForm action={formAction} encType="multipart/form-data">
      <FormError message={state.error} />

      <FormField label="Tipo de reporte" name="tipo_reporte" as="select" required>
        <option value="" disabled>
          Selecciona…
        </option>
        <option value="PERDIDO">Perdido</option>
        <option value="ENCONTRADO">Encontrado</option>
      </FormField>

      <FormField
        label="Especie"
        name="especie"
        required
        placeholder="Ej: Perro, Gato, Ave…"
      />

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
        hint="Incluye código de área. Usaremos este número solo para contacto directo."
      />

      <FormFileField
        label="Foto de la mascota"
        name="foto"
        accept="image/*"
        capture="environment"
        hint="Opcional. Toma una foto con la cámara o elige una de tu galería."
      />

      <SubmitButton pendingLabel="Subiendo foto y publicando…">
        Publicar reporte
      </SubmitButton>
    </ActionForm>
  );
}

export function VoluntarioRegistroForm() {
  const [state, formAction] = useActionState(
    registrarVoluntario,
    initialActionState,
  );

  return (
    <ActionForm action={formAction}>
      <FormError message={state.error} />

      <FormField label="Tipo de ayuda" name="tipo_ayuda" as="select" required>
        <option value="" disabled>
          Selecciona…
        </option>
        <option value="VETERINARIO">Veterinario / Clínica</option>
        <option value="HOGAR_TEMPORAL">Hogar temporal</option>
        <option value="RESCATISTA">Rescatista</option>
        <option value="TRANSPORTE">Transporte</option>
      </FormField>

      <FormField
        label="Nombre o clínica"
        name="nombre_o_clinica"
        required
        placeholder="Tu nombre o nombre del centro"
      />

      <FormField
        label="Zona / Municipio"
        name="ubicacion_zona"
        required
        placeholder="Ej: Barquisimeto, Petare…"
      />

      <FormField
        label="Teléfono de contacto"
        name="contacto_telefono"
        type="tel"
        required
        placeholder="04141234567"
      />

      <SubmitButton>Registrarme como voluntario</SubmitButton>
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
