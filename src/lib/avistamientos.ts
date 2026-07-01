import { getSupabase } from "@/lib/supabase";
import type { Avistamiento, MascotaReportada } from "@/types/database";

export function formatAvistamientoCount(count: number): string {
  if (count === 0) return "0 pistas";
  if (count === 1) return "1 comentario";
  return `${count} comentarios`;
}

type MascotaWithAvistamientoRelation = MascotaReportada & {
  avistamientos?: Array<{ count: number }>;
};

export function normalizeMascotaAvistamientoCount(
  row: MascotaWithAvistamientoRelation,
): MascotaReportada {
  const { avistamientos, ...mascota } = row;
  const avistamientos_count = avistamientos?.[0]?.count ?? 0;
  return { ...mascota, avistamientos_count };
}

export async function fetchAvistamientosByMascotaId(
  mascotaId: string,
): Promise<Avistamiento[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("avistamientos")
    .select("*")
    .eq("mascota_id", mascotaId)
    .order("creado_el", { ascending: false });

  if (error) {
    throw new Error(`Error al cargar avistamientos: ${error.message}`);
  }

  return data ?? [];
}
