"use client";

import { useActionState } from "react";
import { registrarVeterinario } from "@/actions/registro";
import { FormShell } from "@/components/forms/FormShell";
import {
  ActionForm,
  FormError,
  FormField,
  FormFileField,
  SubmitButton,
} from "@/components/forms/FormFields";
import { ImplicitConsentNotice } from "@/components/forms/ImplicitConsentNotice";
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
      <ActionForm action={formAction} encType="multipart/form-data">
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

        <FormField
          label="Información Adicional (Servicios, horarios, detalles...)"
          name="informacion_adicional"
          as="textarea"
          rows={4}
          placeholder="Ej: Consultas de emergencia, cirugías, horario lun–sáb 8am–6pm…"
          hint="Opcional. Horarios, servicios u otros detalles útiles."
        />

        <FormFileField
          label="Logo o banner (Opcional)"
          name="foto"
          accept="image/*"
          hint="Opcional. Sube el logo de tu clínica o una foto representativa."
        />

        <ImplicitConsentNotice />

        <SubmitButton pendingLabel="Subiendo imagen y registrando…">
          Registrar clínica / veterinario
        </SubmitButton>
      </ActionForm>
    </FormShell>
  );
}
