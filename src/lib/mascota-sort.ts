import type { MascotaReportada } from "@/types/database";

export type MascotaSortOrder = "newest" | "oldest";

export function sortMascotasByPublishedDate(
  mascotas: MascotaReportada[],
  order: MascotaSortOrder,
): MascotaReportada[] {
  return [...mascotas].sort((a, b) => {
    const diff =
      new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime();
    return order === "newest" ? diff : -diff;
  });
}
