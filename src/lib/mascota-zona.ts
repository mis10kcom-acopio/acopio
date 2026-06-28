export const MAX_ZONAS_DROPDOWN_VISIBLE = 12;

export type ZonaFilterOption = {
  key: string;
  label: string;
  count: number;
};

const KEY_ZONES = [
  "La Guaira",
  "Catia La Mar",
  "Playa Grande",
  "Maiquetía",
  "Macuto",
  "Naiguatá",
  "Caraballeda",
  "Caracas",
  "Maracay",
  "Valencia",
  "Barquisimeto",
  "Maracaibo",
  "Los Teques",
  "Guarenas",
  "Guatire",
  "Baruta",
  "Chacao",
  "El Hatillo",
  "Sucre",
  "Los Corales",
  "Caricuao",
  "Antímano",
  "La Vega",
  "Carayaca",
  "Vargas",
  "Tanaguarena",
  "Los Caracas",
  "Urimare",
  "Caruao",
] as const;

const KEY_ZONES_BY_LENGTH = [...KEY_ZONES].sort(
  (left, right) => normalizeText(right).length - normalizeText(left).length,
);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toZoneKey(label: string): string {
  return normalizeText(label).replace(/\s+/g, "-");
}

export function cleanUbicacionText(value: string): string {
  return value.split(/[,/(-]/)[0]?.trim() ?? "";
}

function matchKeyZone(cleanedText: string): string | null {
  const normalizedText = normalizeText(cleanedText);
  if (!normalizedText) return null;

  for (const zone of KEY_ZONES_BY_LENGTH) {
    const normalizedZone = normalizeText(zone);
    if (normalizedZone && normalizedText.includes(normalizedZone)) {
      return zone;
    }
  }

  return null;
}

function extractFirstTwoWords(cleanedText: string): {
  key: string;
  label: string;
} | null {
  const trimmed = cleanedText.trim();
  if (!trimmed) return null;

  const normalizedWords = normalizeText(trimmed).split(" ").filter(Boolean);
  if (normalizedWords.length === 0) return null;

  const key = normalizedWords.slice(0, 2).join("-");
  const originalWords = trimmed.split(/\s+/).filter(Boolean);
  const label = originalWords.slice(0, 2).join(" ");

  return { key, label };
}

export function resolveMascotaZona(ubicacionZona: string): {
  key: string;
  label: string;
} | null {
  const cleanedText = cleanUbicacionText(ubicacionZona);
  if (!cleanedText) return null;

  const keyZone = matchKeyZone(cleanedText);
  if (keyZone) {
    return { key: toZoneKey(keyZone), label: keyZone };
  }

  return extractFirstTwoWords(cleanedText);
}

export function getMascotaZonaGroupKey(ubicacionZona: string): string | null {
  return resolveMascotaZona(ubicacionZona)?.key ?? null;
}

export function getMascotaZonaLabel(ubicacionZona: string): string | null {
  return resolveMascotaZona(ubicacionZona)?.label ?? null;
}

export function buildZonaFilterOptions(
  mascotas: { ubicacion_zona: string }[],
): ZonaFilterOption[] {
  const groups = new Map<string, { label: string; count: number }>();

  for (const mascota of mascotas) {
    const zone = resolveMascotaZona(mascota.ubicacion_zona);
    if (!zone) continue;

    const group = groups.get(zone.key) ?? { label: zone.label, count: 0 };
    group.count += 1;
    groups.set(zone.key, group);
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, "es");
    })
    .map((option) => ({
      key: toZoneKey(option.label),
      label: option.label,
      count: option.count,
    }));
}

export function matchesZonaFilter(
  ubicacionZona: string,
  selectedKey: string | null,
): boolean {
  if (!selectedKey) return true;
  return getMascotaZonaGroupKey(ubicacionZona) === selectedKey;
}

export function filterMascotasByZonaGroup<T extends { ubicacion_zona: string }>(
  items: T[],
  selectedKey: string | null,
): T[] {
  if (!selectedKey) return items;
  return items.filter((item) => matchesZonaFilter(item.ubicacion_zona, selectedKey));
}
