const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapa entidades HTML para almacenamiento seguro. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/**
 * Elimina etiquetas HTML, patrones de script y escapa el resultado.
 * Pensado para campos de texto libre antes de persistir en Supabase.
 */
export function sanitizeTextInput(value: string): string {
  let sanitized = value.trim();

  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  return escapeHtml(sanitized);
}

export function sanitizeOptionalTextInput(value: string | null): string | null {
  if (value === null) return null;
  const sanitized = sanitizeTextInput(value);
  return sanitized.length > 0 ? sanitized : null;
}

/** Teléfonos: sin HTML y solo caracteres habituales de marcación. */
export function sanitizePhoneInput(value: string): string {
  const stripped = sanitizeTextInput(value);
  return stripped.replace(/[^\d+\s()-]/g, "").trim();
}

export function sanitizeOptionalPhoneInput(value: string | null): string | null {
  if (value === null) return null;
  const sanitized = sanitizePhoneInput(value);
  return sanitized.length > 0 ? sanitized : null;
}

const ESPECIE_VALUES = new Set(["Perro", "Gato", "Otro"]);

export function sanitizeEspecieInput(value: string | null): string | null {
  if (value === null) return null;
  const sanitized = sanitizeTextInput(value);
  if (!sanitized) return null;
  return ESPECIE_VALUES.has(sanitized) ? sanitized : null;
}
