"use client";

import { useActionState } from "react";
import { registrarVoluntario } from "@/actions/registro";
import { FormShell } from "@/components/forms/FormShell";
import {
  ActionForm,
  FormError,
  FormField,
  FormFileField,
  SubmitButton,
} from "@/components/forms/FormFields";
import { ImplicitConsentNotice } from "@/components/forms/ImplicitConsentNotice";
import { OptionalPhoneField } from "@/components/forms/OptionalPhoneField";
import { WhatsappField } from "@/components/forms/WhatsappField";
import { initialActionState } from "@/types/actions";

export default function RegistroVoluntarioPage() {
  const [state, formAction] = useActionState(
    registrarVoluntario,
    initialActionState,
  );

  return (
    <FormShell
      title="Registro de voluntario"
      description="Ofrece ayuda como hogar temporal, rescatista o transporte. Recibirás un enlace para gestionar tu disponibilidad."
    >
      <ActionForm action={formAction} encType="multipart/form-data">
        <FormError message={state.error} />

        <FormField label="Tipo de ayuda" name="tipo_ayuda" as="select" required>
          <option value="" disabled>
            Selecciona…
          </option>
          <option value="HOGAR_TEMPORAL">Hogar temporal</option>
          <option value="RESCATISTA">Rescatista</option>
          <option value="TRANSPORTE">Transporte</option>
        </FormField>

        <FormField
          label="Nombre y Apellido"
          name="nombre_o_clinica"
          required
          placeholder="Tu nombre y apellido"
        />

        <FormField
          label="Zona / Municipio"
          name="ubicacion_zona"
          required
          placeholder="Ej: Barquisimeto, Petare…"
        />

        <OptionalPhoneField />

        <WhatsappField />

        <FormField
          label="Información Adicional (Servicios, horarios, detalles...)"
          name="informacion_adicional"
          as="textarea"
          rows={4}
          placeholder="Ej: Atención 24h, servicio de emergencias, capacidad para 3 mascotas…"
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
          Registrarme como voluntario
        </SubmitButton>
      </ActionForm>
    </FormShell>
  );
}
