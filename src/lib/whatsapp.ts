export function buildWhatsAppUrl(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  const withCountry =
    digits.startsWith("58") || digits.length > 10 ? digits : `58${digits}`;
  return `https://wa.me/${withCountry}`;
}
