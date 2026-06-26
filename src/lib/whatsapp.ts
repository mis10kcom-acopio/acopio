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

export function buildWhatsAppUrl(telefono: string): string {
  const cleanNumber = formatWhatsAppNumber(telefono);
  return `https://wa.me/${cleanNumber}`;
}
