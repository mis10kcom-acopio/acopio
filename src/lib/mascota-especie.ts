export const MASCOTA_ESPECIES = ["Perro", "Gato", "Otro"] as const;

export type MascotaEspecie = (typeof MASCOTA_ESPECIES)[number];

export function parseEspecieMascota(value: string): MascotaEspecie {
  const trimmed = value.trim();
  if (MASCOTA_ESPECIES.includes(trimmed as MascotaEspecie)) {
    return trimmed as MascotaEspecie;
  }
  throw new Error("Selecciona una especie válida (Perro, Gato u Otro).");
}

/** Normaliza valores legacy de texto libre para consultas de match. */
export function normalizeEspecieForMatch(value: string): MascotaEspecie {
  const trimmed = value.trim();
  if (MASCOTA_ESPECIES.includes(trimmed as MascotaEspecie)) {
    return trimmed as MascotaEspecie;
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("perr")) return "Perro";
  if (lower.startsWith("gat")) return "Gato";
  return "Otro";
}
