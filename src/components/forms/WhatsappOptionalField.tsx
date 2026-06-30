import { FormField } from "@/components/forms/FormFields";

export const WHATSAPP_OPTIONAL_HINT =
  "Si es distinto al teléfono de llamadas. El botón de WhatsApp solo aparece si lo indicas.";

export function WhatsappOptionalField({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <FormField
      label="Número de WhatsApp (Opcional)"
      name="contacto_whatsapp"
      type="tel"
      defaultValue={defaultValue}
      placeholder="Ej: +584141234567"
      hint={WHATSAPP_OPTIONAL_HINT}
    />
  );
}
