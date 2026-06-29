import type { MascotaReportada } from "@/types/database";

export type MascotaFotosSource = Pick<
  MascotaReportada,
  "foto_url" | "foto_url_2" | "foto_url_3"
>;

export function getMascotaFotos(mascota: MascotaFotosSource): string[] {
  return [mascota.foto_url, mascota.foto_url_2, mascota.foto_url_3].filter(
    (url): url is string => Boolean(url?.trim()),
  );
}

export function getMascotaPrimaryFotoUrl(
  mascota: MascotaFotosSource,
): string | null {
  return mascota.foto_url ?? mascota.foto_url_2 ?? mascota.foto_url_3 ?? null;
}
