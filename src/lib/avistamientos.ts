import { getSupabase } from "@/lib/supabase";
import type { Avistamiento } from "@/types/database";

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
