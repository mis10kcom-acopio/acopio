export function buildTelUrl(telefono: string): string {
  return `tel:${telefono.replace(/\s/g, "")}`;
}

export function formatWhatsAppNumber(contactoWhatsapp: string): string {
  let cleanNumber = contactoWhatsapp.replace(/[^\d+]/g, "");
  if (!cleanNumber.startsWith("+")) {
    cleanNumber = `+${cleanNumber}`;
  }
  return cleanNumber;
}

export function cleanPhoneDigitsOnly(telefono: string): string {
  return telefono.replace(/\D/g, "");
}

export function buildWhatsAppUrl(telefono: string): string {
  const cleanNumber = formatWhatsAppNumber(telefono);
  return `https://wa.me/${cleanNumber}`;
}

export function buildWhatsAppSelfSaveUrl(
  telefono: string,
  editUrl: string,
): string {
  const numeroLimpio = cleanPhoneDigitsOnly(telefono);
  const text = `Guarda este mensaje. Mi enlace de edición en Huellas a Salvo es: ${editUrl}`;
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(text)}`;
}
