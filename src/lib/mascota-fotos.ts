import { resolveStoragePublicUrl } from "@/lib/storage-upload";
import type { MascotaReportada } from "@/types/database";

export type MascotaFotosSource = Pick<
  MascotaReportada,
  "foto_url" | "foto_url_2" | "foto_url_3"
>;

export function getMascotaFotos(mascota: MascotaFotosSource): string[] {
  return [mascota.foto_url, mascota.foto_url_2, mascota.foto_url_3]
    .map((url) => resolveStoragePublicUrl(url))
    .filter((url): url is string => Boolean(url));
}

export function getMascotaPrimaryFotoUrl(
  mascota: MascotaFotosSource,
): string | null {
  return getMascotaFotos(mascota)[0] ?? null;
}
