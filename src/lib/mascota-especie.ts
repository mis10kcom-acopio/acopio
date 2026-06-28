export type EspecieMascota = "Perro" | "Gato" | "Otro";
export type EspecieFilterId = "perro" | "gato" | "otro";

export const ESPECIE_FORM_OPTIONS: {
  value: EspecieMascota;
  label: string;
  emoji: string;
}[] = [
  { value: "Perro", label: "Perro", emoji: "🐕" },
  { value: "Gato", label: "Gato", emoji: "🐈" },
  { value: "Otro", label: "Otro", emoji: "🐾" },
];

export const ESPECIE_FILTER_OPTIONS: {
  id: EspecieFilterId;
  label: string;
  value: EspecieMascota;
}[] = [
  { id: "perro", label: "Perros", value: "Perro" },
  { id: "gato", label: "Gatos", value: "Gato" },
  { id: "otro", label: "Otros", value: "Otro" },
];

export function normalizeEspecie(
  especie: string | null | undefined,
): EspecieMascota | null {
  if (!especie?.trim()) return null;

  const lower = especie.trim().toLowerCase();
  if (lower.startsWith("perr")) return "Perro";
  if (lower.startsWith("gat")) return "Gato";
  if (lower === "otro" || lower === "otros") return "Otro";

  return null;
}

export function matchesEspecieFilter(
  mascota: { especie?: string | null },
  activeFilter: EspecieFilterId | null,
): boolean {
  if (!activeFilter) return true;

  const normalized = normalizeEspecie(mascota.especie);
  if (normalized === null) return true;

  const filterValue = ESPECIE_FILTER_OPTIONS.find(
    (option) => option.id === activeFilter,
  )?.value;

  return normalized === filterValue;
}

export function filterMascotasByEspecie<T extends { especie?: string | null }>(
  items: T[],
  activeFilter: EspecieFilterId | null,
): T[] {
  if (!activeFilter) return items;
  return items.filter((item) => matchesEspecieFilter(item, activeFilter));
}
