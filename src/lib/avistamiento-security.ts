import { sanitizeOptionalTextInput, sanitizeTextInput } from "@/lib/sanitize-input";

export const AVISTAMIENTO_COMENTARIO_MAX_LENGTH = 280;

const URL_PATTERN =
  /(?:https?:\/\/|www\.)|(?:[a-z0-9-]+\.)+(?:com|org|net|io|co|ve|app|xyz|me|info|biz|edu|gov)(?:\/|\b)/i;

export function containsBlockedUrl(value: string): boolean {
  return URL_PATTERN.test(value);
}

export function assertNoBlockedUrls(value: string, fieldLabel: string): void {
  if (containsBlockedUrl(value)) {
    throw new Error(
      `${fieldLabel} no puede incluir enlaces web (http, https o www).`,
    );
  }
}

export function sanitizeAvistamientoComment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("El comentario es obligatorio.");
  }
  if (trimmed.length > AVISTAMIENTO_COMENTARIO_MAX_LENGTH) {
    throw new Error(
      `El comentario no puede superar ${AVISTAMIENTO_COMENTARIO_MAX_LENGTH} caracteres.`,
    );
  }

  assertNoBlockedUrls(trimmed, "El comentario");

  const sanitized = sanitizeTextInput(trimmed);
  if (!sanitized) {
    throw new Error("El comentario es obligatorio.");
  }

  return sanitized;
}

export function sanitizeAvistamientoOptionalText(
  value: string | null,
  fieldLabel: string,
): string | null {
  if (value === null) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  assertNoBlockedUrls(trimmed, fieldLabel);

  return sanitizeOptionalTextInput(trimmed);
}
