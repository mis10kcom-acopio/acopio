export type WhatsappCountryOption = {
  flag: string;
  dialCode: string;
  label: string;
};

export const WHATSAPP_COUNTRY_OPTIONS: WhatsappCountryOption[] = [
  { flag: "🇻🇪", dialCode: "+58", label: "Venezuela" },
  { flag: "🇺🇸", dialCode: "+1", label: "Estados Unidos" },
  { flag: "🇪🇸", dialCode: "+34", label: "España" },
  { flag: "🇨🇴", dialCode: "+57", label: "Colombia" },
  { flag: "🇵🇪", dialCode: "+51", label: "Perú" },
  { flag: "🇦🇷", dialCode: "+54", label: "Argentina" },
  { flag: "🇨🇱", dialCode: "+56", label: "Chile" },
  { flag: "🇲🇽", dialCode: "+52", label: "México" },
  { flag: "🇵🇦", dialCode: "+507", label: "Panamá" },
  { flag: "🇩🇴", dialCode: "+1", label: "República Dominicana" },
  { flag: "🇵🇹", dialCode: "+351", label: "Portugal" },
  { flag: "🇮🇹", dialCode: "+39", label: "Italia" },
];

export const DEFAULT_WHATSAPP_DIAL_CODE = "+58";

const KNOWN_DIAL_CODES = [...WHATSAPP_COUNTRY_OPTIONS]
  .map((option) => option.dialCode)
  .sort((a, b) => b.length - a.length);

export function normalizeWhatsappDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidWhatsappNumberDigits(digits: string): boolean {
  return digits.length >= 7 && digits.length <= 15;
}

export function parseStoredWhatsapp(stored: string | null | undefined): {
  dialCode: string;
  number: string;
} {
  if (!stored?.trim()) {
    return { dialCode: DEFAULT_WHATSAPP_DIAL_CODE, number: "" };
  }

  const cleaned = stored.trim().replace(/\s/g, "");

  for (const dialCode of KNOWN_DIAL_CODES) {
    if (cleaned.startsWith(dialCode)) {
      return {
        dialCode,
        number: normalizeWhatsappDigits(cleaned.slice(dialCode.length)),
      };
    }
  }

  if (cleaned.startsWith("+")) {
    const match = cleaned.match(/^(\+\d{1,4})(\d*)$/);
    if (match) {
      return {
        dialCode: match[1],
        number: normalizeWhatsappDigits(match[2]),
      };
    }
  }

  return {
    dialCode: DEFAULT_WHATSAPP_DIAL_CODE,
    number: normalizeWhatsappDigits(cleaned),
  };
}

export function combineWhatsappPhone(dialCode: string, number: string): string {
  const normalizedDialCode = dialCode.trim();
  const digits = normalizeWhatsappDigits(number);

  if (!normalizedDialCode.startsWith("+") || !/^\+\d{1,4}$/.test(normalizedDialCode)) {
    throw new Error("Selecciona un código de país válido para WhatsApp.");
  }

  if (!isValidWhatsappNumberDigits(digits)) {
    throw new Error(
      "El número de WhatsApp debe tener entre 7 y 15 dígitos, solo números.",
    );
  }

  return `${normalizedDialCode}${digits}`;
}
