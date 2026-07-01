import { FormField } from "@/components/forms/FormFields";

export const OPTIONAL_PHONE_HINT = "Para llamadas y SMS. Opcional.";

export function OptionalPhoneField({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <FormField
      label="Teléfono de contacto (Opcional)"
      name="contacto_telefono"
      type="tel"
      defaultValue={defaultValue}
      placeholder="02121234567"
      hint={OPTIONAL_PHONE_HINT}
    />
  );
}
