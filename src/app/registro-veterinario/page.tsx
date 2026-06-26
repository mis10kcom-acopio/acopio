"use client";

import { useActionState } from "react";
import { registrarVeterinario } from "@/actions/registro";
import { FormShell } from "@/components/forms/FormShell";
import {
  ActionForm,
  FormError,
  FormField,
  SubmitButton,
} from "@/components/forms/FormFields";
import { initialActionState } from "@/types/actions";

export default function RegistroVeterinarioPage() {
  const [state, formAction] = useActionState(
    registrarVeterinario,
    initialActionState,
  );

  return (
    <FormShell
      title="Registrar clínica o veterinario"
      description="Únete a la red de atención veterinaria de emergencia. Recibirás un enlace para gestionar tu disponibilidad."
    >
      <ActionForm action={formAction}>
        <FormError message={state.error} />

        <FormField
          label="Nombre de la Clínica o Veterinario"
          name="nombre_o_clinica"
          required
          placeholder="Ej: Clínica Veterinaria San Francisco, Dr. García…"
        />

        <FormField
          label="Zona / Municipio"
          name="ubicacion_zona"
          required
          placeholder="Ej: Caracas, Valencia, Maracaibo…"
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

        <SubmitButton>Registrar clínica / veterinario</SubmitButton>
      </ActionForm>
    </FormShell>
  );
}
