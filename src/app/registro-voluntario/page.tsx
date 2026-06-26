"use client";

import { useActionState, useState } from "react";
import { registrarVoluntario } from "@/actions/registro";
import { FormShell } from "@/components/forms/FormShell";
import {
  ActionForm,
  FormError,
  FormField,
  SubmitButton,
} from "@/components/forms/FormFields";
import { initialActionState } from "@/types/actions";
import type { TipoAyuda } from "@/types/database";

function getNombreLabel(tipoAyuda: TipoAyuda | ""): string {
  if (tipoAyuda === "VETERINARIO") {
    return "Nombre o clínica";
  }
  if (
    tipoAyuda === "HOGAR_TEMPORAL" ||
    tipoAyuda === "RESCATISTA" ||
    tipoAyuda === "TRANSPORTE"
  ) {
    return "Nombre y Apellido";
  }
  return "Nombre o clínica";
}

export default function RegistroVoluntarioPage() {
  const [state, formAction] = useActionState(
    registrarVoluntario,
    initialActionState,
  );
  const [tipoAyuda, setTipoAyuda] = useState<TipoAyuda | "">("");

  const nombreLabel = getNombreLabel(tipoAyuda);
  const nombrePlaceholder =
    tipoAyuda === "VETERINARIO"
      ? "Nombre del veterinario o de la clínica"
      : tipoAyuda
        ? "Tu nombre y apellido"
        : "Selecciona primero el tipo de ayuda";

  return (
    <FormShell
      title="Registro de voluntario"
      description="Ofrece ayuda como veterinario, hogar temporal, rescatista o transporte. Recibirás un enlace para gestionar tu disponibilidad."
    >
      <ActionForm action={formAction}>
        <FormError message={state.error} />

        <FormField
          label="Tipo de ayuda"
          name="tipo_ayuda"
          as="select"
          required
          onSelectChange={(value) => setTipoAyuda(value as TipoAyuda | "")}
        >
          <option value="" disabled>
            Selecciona…
          </option>
          <option value="VETERINARIO">Veterinario / Clínica</option>
          <option value="HOGAR_TEMPORAL">Hogar temporal</option>
          <option value="RESCATISTA">Rescatista</option>
          <option value="TRANSPORTE">Transporte</option>
        </FormField>

        <FormField
          label={nombreLabel}
          name="nombre_o_clinica"
          required
          placeholder={nombrePlaceholder}
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
          hint="Para llamadas y SMS. Obligatorio."
        />

        <FormField
          label="Número de WhatsApp (Opcional)"
          name="contacto_whatsapp"
          type="tel"
          placeholder="Ej: +584141234567"
          hint="Si es distinto al teléfono de llamadas."
        />

        <SubmitButton>Registrarme como voluntario</SubmitButton>
      </ActionForm>
    </FormShell>
  );
}
