const GENERIC_WORDS = new Set([
  "sector",
  "calle",
  "avenida",
  "av",
  "res",
  "residencia",
  "edificio",
  "edif",
  "urb",
  "urbanizacion",
  "cerca",
  "frente",
  "detras",
  "esquina",
  "local",
]);

const LOWERCASE_PARTICLES = new Set(["la", "de", "del", "y"]);

export const MIN_MASCOTAS_POR_ZONA = 2;
export const MAX_ZONAS_VISIBLES = 8;

export type ZonaFilterOption = {
  key: string;
  label: string;
  count: number;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSignificantWords(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((word) => word && !GENERIC_WORDS.has(word));
}

function titleCasePlaceName(words: string[]): string {
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && LOWERCASE_PARTICLES.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function extractZoneLabel(significantWords: string[], fallback: string): string {
  if (significantWords.length === 0) {
    const trimmed = fallback.trim();
    return trimmed || "Sin zona";
  }

  return titleCasePlaceName(significantWords.slice(0, 3));
}

export function getMascotaZonaGroupKey(ubicacionZona: string): string {
  const normalized = normalizeText(ubicacionZona);

  if (normalized.includes("guaira")) {
    return "la-guaira";
  }

  const significantWords = getSignificantWords(ubicacionZona);
  if (significantWords.length === 0) {
    return normalized || "sin-zona";
  }

  return significantWords[0];
}

export function getMascotaZonaLabel(ubicacionZona: string): string {
  const normalized = normalizeText(ubicacionZona);

  if (normalized.includes("guaira")) {
    return "La Guaira";
  }

  return extractZoneLabel(getSignificantWords(ubicacionZona), ubicacionZona);
}

function pickBestLabel(labels: Map<string, number>): string {
  let bestLabel = "";
  let bestCount = -1;
  let bestWordCount = -1;

  for (const [label, count] of labels) {
    const wordCount = label.split(" ").length;
    if (
      count > bestCount ||
      (count === bestCount && wordCount > bestWordCount)
    ) {
      bestLabel = label;
      bestCount = count;
      bestWordCount = wordCount;
    }
  }

  return bestLabel;
}

export function buildZonaFilterOptions(
  mascotas: { ubicacion_zona: string }[],
): ZonaFilterOption[] {
  const groups = new Map<
    string,
    { labels: Map<string, number>; count: number }
  >();

  for (const mascota of mascotas) {
    const key = getMascotaZonaGroupKey(mascota.ubicacion_zona);
    const label = getMascotaZonaLabel(mascota.ubicacion_zona);

    const group = groups.get(key) ?? { labels: new Map(), count: 0 };
    group.count += 1;
    group.labels.set(label, (group.labels.get(label) ?? 0) + 1);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      label: pickBestLabel(group.labels),
      count: group.count,
    }))
    .filter((option) => option.count >= MIN_MASCOTAS_POR_ZONA)
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, "es");
    });
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
