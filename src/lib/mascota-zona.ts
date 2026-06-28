export const MIN_MASCOTAS_POR_ZONA = 2;
export const MAX_ZONAS_VISIBLES = 10;

export type ZonaFilterOption = {
  key: string;
  label: string;
  count: number;
};

const REFERENCE_ZONES = [
  "Lechería",
  "Puerto La Cruz",
  "Caracas",
  "Maracaibo",
  "Valencia",
  "Barquisimeto",
  "Maracay",
  "Ciudad Guayana",
  "Maturín",
  "San Cristóbal",
  "Barinas",
  "Ciudad Bolívar",
  "Barcelona",
  "Cumaná",
  "Punto Fijo",
  "Cabimas",
  "Mérida",
  "Ciudad Ojeda",
  "Coro",
  "Turmero",
  "Los Teques",
  "Guanare",
  "San Felipe",
  "Acarigua",
  "Araure",
  "Carora",
  "El Tigre",
  "Guarenas",
  "Cabudare",
  "Carúpano",
  "San Fernando de Apure",
  "Puerto Cabello",
  "El Tocuyo",
  "Valera",
  "La Victoria",
  "Calabozo",
  "Porlamar",
  "Pampatar",
  "El Vigía",
  "Puerto Ayacucho",
  "Tucupita",
  "Guatire",
  "23 de Enero",
  "Altagracia",
  "Antímano",
  "Candelaria",
  "Caricuao",
  "Catedral",
  "Coche",
  "El Junquito",
  "El Paraíso",
  "El Recreo",
  "El Valle",
  "La Pastora",
  "La Vega",
  "Macarao",
  "San Agustín",
  "San Bernardino",
  "San José",
  "San Juan",
  "San Pedro",
  "Santa Rosalía",
  "Santa Teresa",
  "Sucre",
  "Caraballeda",
  "Caribe",
  "Los Corales",
  "Tanaguarena",
  "Palmar Este",
  "Palmar Oeste",
  "Cerro Grande",
  "Carayaca",
  "El Limón",
  "Chichiriviche de la Costa",
  "Puerto Cruz",
  "Tarma",
  "Tirima",
  "Carlos Soublette",
  "10 de Marzo",
  "Montesano",
  "Pariata",
  "Mare Abajo",
  "Los Dos Cerritos",
  "Caruao",
  "Chuspa",
  "La Sabana",
  "Todasana",
  "Osma",
  "Oritapo",
  "Quebrada Seca",
  "Catia La Mar",
  "Playa Grande",
  "La Guaira",
  "Macuto",
  "Maiquetía",
  "Naiguatá",
  "Urimare",
  "Los Caracas",
  "Guacara",
  "Naguanagua",
  "San Diego",
  "Tocuyito",
  "Los Guayos",
  "Mariara",
  "San Joaquín",
  "Morón",
  "Tucacas",
  "Chichiriviche",
] as const;

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

export function matchZonaReferencia(ubicacionZona: string): string | null {
  const normalizedUbicacion = normalizeText(ubicacionZona);
  if (!normalizedUbicacion) return null;

  let bestMatch: string | null = null;
  let bestLength = 0;

  for (const zone of REFERENCE_ZONES) {
    const normalizedZone = normalizeText(zone);
    if (!normalizedZone) continue;

    if (
      normalizedUbicacion.includes(normalizedZone) &&
      normalizedZone.length > bestLength
    ) {
      bestMatch = zone;
      bestLength = normalizedZone.length;
    }
  }

  return bestMatch;
}

export function getMascotaZonaGroupKey(ubicacionZona: string): string | null {
  const match = matchZonaReferencia(ubicacionZona);
  return match ? toZoneKey(match) : null;
}

export function getMascotaZonaLabel(ubicacionZona: string): string | null {
  return matchZonaReferencia(ubicacionZona);
}

export function buildZonaFilterOptions(
  mascotas: { ubicacion_zona: string }[],
): ZonaFilterOption[] {
  const groups = new Map<string, { label: string; count: number }>();

  for (const mascota of mascotas) {
    const label = matchZonaReferencia(mascota.ubicacion_zona);
    if (!label) continue;

    const key = toZoneKey(label);
    const group = groups.get(key) ?? { label, count: 0 };
    group.count += 1;
    groups.set(key, group);
  }

  return [...groups.values()]
    .filter((option) => option.count >= MIN_MASCOTAS_POR_ZONA)
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
