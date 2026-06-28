export const MAX_ZONAS_DROPDOWN_VISIBLE = 12;

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

function extractFirstTwoWords(ubicacionZona: string): {
  key: string;
  label: string;
} | null {
  const trimmed = ubicacionZona.trim();
  if (!trimmed) return null;

  const normalizedWords = normalizeText(trimmed).split(" ").filter(Boolean);
  if (normalizedWords.length === 0) return null;

  const key = normalizedWords.slice(0, 2).join("-");
  const originalWords = trimmed.split(/\s+/).filter(Boolean);
  const label = originalWords.slice(0, 2).join(" ");

  return { key, label };
}

function pickBestLabel(labels: Map<string, number>): string {
  let bestLabel = "";
  let bestCount = -1;

  for (const [label, count] of labels) {
    if (count > bestCount) {
      bestLabel = label;
      bestCount = count;
    }
  }

  return bestLabel;
}

export function getMascotaZonaGroupKey(ubicacionZona: string): string | null {
  return extractFirstTwoWords(ubicacionZona)?.key ?? null;
}

export function getMascotaZonaLabel(ubicacionZona: string): string | null {
  return extractFirstTwoWords(ubicacionZona)?.label ?? null;
}

export function buildZonaFilterOptions(
  mascotas: { ubicacion_zona: string }[],
): ZonaFilterOption[] {
  const groups = new Map<
    string,
    { labels: Map<string, number>; count: number }
  >();

  for (const mascota of mascotas) {
    const zone = extractFirstTwoWords(mascota.ubicacion_zona);
    if (!zone) continue;

    const group = groups.get(zone.key) ?? { labels: new Map(), count: 0 };
    group.count += 1;
    group.labels.set(zone.label, (group.labels.get(zone.label) ?? 0) + 1);
    groups.set(zone.key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      label: pickBestLabel(group.labels),
      count: group.count,
    }))
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
