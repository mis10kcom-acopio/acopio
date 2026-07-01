import { getMascotaEstado } from "@/lib/mascota-estado";
import type { MascotaReportada } from "@/types/database";

/** Ventana de rotación justa (6 horas). */
export const MASCOTA_ROTATION_WINDOW_MS = 6 * 60 * 60 * 1000;

/** Primeros puestos reservados para mascotas perdidas antiguas. */
export const MASCOTA_SPOTLIGHT_COUNT = 4;

/** Antigüedad mínima para entrar al pool de destacados rotativos. */
export const MASCOTA_SPOTLIGHT_MIN_DAYS = 7;

function stableHash32(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getMascotaRotationWindowIndex(
  now: number = Date.now(),
): number {
  return Math.floor(now / MASCOTA_ROTATION_WINDOW_MS);
}

export function daysSinceCreated(
  creadoEl: string,
  now: number = Date.now(),
): number {
  const ms = now - new Date(creadoEl).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function fairRotationScore(
  mascota: MascotaReportada,
  windowIndex: number,
  now: number,
): number {
  const ageDays = daysSinceCreated(mascota.creado_el, now);
  const tieBreak = stableHash32(`${mascota.id}:${windowIndex}`);
  return ageDays * 1_000_000 + tieBreak;
}

export function selectSpotlightMascotas(
  perdidos: MascotaReportada[],
  count: number,
  windowIndex: number,
  now: number = Date.now(),
): MascotaReportada[] {
  const pool = perdidos
    .filter(
      (mascota) =>
        daysSinceCreated(mascota.creado_el, now) >= MASCOTA_SPOTLIGHT_MIN_DAYS,
    )
    .sort((a, b) => a.id.localeCompare(b.id));

  if (pool.length === 0) return [];

  const take = Math.min(count, pool.length);
  const start = (windowIndex * take) % pool.length;
  const selected: MascotaReportada[] = [];

  for (let i = 0; i < pool.length && selected.length < take; i++) {
    selected.push(pool[(start + i) % pool.length]!);
  }

  return selected;
}

/**
 * Reordena la lista filtrada sin quitar registros:
 * 1. Destacados rotativos (perdidos con 7+ días)
 * 2. Resto de perdidos con rotación justa cada 6 h
 * 3. En resguardo / adopción por fecha (más recientes primero)
 */
export function applyMascotaListRotation(
  mascotas: MascotaReportada[],
  now: number = Date.now(),
): MascotaReportada[] {
  if (mascotas.length <= 1) return [...mascotas];

  const perdidos: MascotaReportada[] = [];
  const otros: MascotaReportada[] = [];

  for (const mascota of mascotas) {
    if (getMascotaEstado(mascota) === "PERDIDO") {
      perdidos.push(mascota);
    } else {
      otros.push(mascota);
    }
  }

  if (perdidos.length === 0) {
    return [...mascotas].sort(
      (a, b) =>
        new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime(),
    );
  }

  const windowIndex = getMascotaRotationWindowIndex(now);
  const spotlight = selectSpotlightMascotas(
    perdidos,
    MASCOTA_SPOTLIGHT_COUNT,
    windowIndex,
    now,
  );
  const spotlightIds = new Set(spotlight.map((mascota) => mascota.id));

  const remainingPerdidos = perdidos
    .filter((mascota) => !spotlightIds.has(mascota.id))
    .sort(
      (a, b) =>
        fairRotationScore(b, windowIndex, now) -
        fairRotationScore(a, windowIndex, now),
    );

  const sortedOtros = [...otros].sort(
    (a, b) =>
      new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime(),
  );

  const result = [...spotlight, ...remainingPerdidos, ...sortedOtros];

  if (result.length !== mascotas.length) {
    return [...mascotas];
  }

  return result;
}
