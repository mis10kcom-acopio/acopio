import {
  combineWhatsappPhone,
  normalizeWhatsappDigits,
} from "@/lib/whatsapp-phone";
import {
  sanitizeEspecieInput,
  sanitizeOptionalPhoneInput,
  sanitizeOptionalTextInput,
  sanitizePhoneInput,
  sanitizeTextInput,
} from "@/lib/sanitize-input";

function readFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export function getRequiredRaw(formData: FormData, key: string): string {
  const value = readFormValue(formData, key);
  if (!value) {
    throw new Error(`El campo "${key}" es obligatorio.`);
  }
  return value;
}

export function getOptionalRaw(formData: FormData, key: string): string | null {
  return readFormValue(formData, key);
}

export function getRequiredSanitizedText(
  formData: FormData,
  key: string,
): string {
  const sanitized = sanitizeTextInput(getRequiredRaw(formData, key));
  if (!sanitized) {
    throw new Error(`El campo "${key}" es obligatorio.`);
  }
  return sanitized;
}

export function getOptionalSanitizedText(
  formData: FormData,
  key: string,
): string | null {
  return sanitizeOptionalTextInput(getOptionalRaw(formData, key));
}

export function getRequiredSanitizedPhone(
  formData: FormData,
  key: string,
): string {
  const sanitized = sanitizePhoneInput(getRequiredRaw(formData, key));
  if (!sanitized) {
    throw new Error(`El campo "${key}" es obligatorio.`);
  }
  return sanitized;
}

export function getOptionalSanitizedPhone(
  formData: FormData,
  key: string,
): string | null {
  return sanitizeOptionalPhoneInput(getOptionalRaw(formData, key));
}

/** Teléfono opcional; devuelve cadena vacía si no se indicó (columnas NOT NULL). */
export function getOptionalContactPhone(
  formData: FormData,
  key = "contacto_telefono",
): string {
  return getOptionalSanitizedPhone(formData, key) ?? "";
}

export function getRequiredWhatsappPhone(formData: FormData): string {
  const dialCode = getRequiredRaw(formData, "contacto_whatsapp_codigo");
  const number = getRequiredRaw(formData, "contacto_whatsapp_numero");
  const digits = normalizeWhatsappDigits(number);

  if (!digits) {
    throw new Error("El número de WhatsApp es obligatorio.");
  }

  return combineWhatsappPhone(dialCode, digits);
}

export function getOptionalSanitizedEspecie(
  formData: FormData,
  key: string,
): string | null {
  return sanitizeEspecieInput(getOptionalRaw(formData, key));
}

export function getRequiredSelect(formData: FormData, key: string): string {
  const value = getRequiredRaw(formData, key);
  if (value.toLowerCase().startsWith("selecciona")) {
    throw new Error(`Selecciona una opción válida en "${key}".`);
  }
  return value;
}
