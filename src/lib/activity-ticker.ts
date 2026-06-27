import { unstable_cache } from "next/cache";
import { getMascotaEstado, MASCOTA_ESTADO_CONFIG } from "@/lib/mascota-estado";
import { getSupabase } from "@/lib/supabase";
import type { TipoAyuda } from "@/types/database";

export type ActivityItem = {
  id: string;
  creado_el: string;
  tipo: string;
  genero: "o" | "a";
};

const VOLUNTARIO_LABELS: Record<TipoAyuda, { tipo: string; genero: "o" | "a" }> =
  {
    VETERINARIO: { tipo: "Veterinario", genero: "o" },
    HOGAR_TEMPORAL: { tipo: "Hogar temporal", genero: "o" },
    RESCATISTA: { tipo: "Rescatista", genero: "o" },
    TRANSPORTE: { tipo: "Transporte", genero: "o" },
  };

async function fetchRecentActivityUncached(): Promise<ActivityItem[]> {
  try {
    const supabase = getSupabase();

    const [mascotasResult, voluntariosResult, acopiosResult] = await Promise.all([
      supabase
        .from("mascotas_reportadas")
        .select("id, creado_el, estado, tipo_reporte")
        .order("creado_el", { ascending: false })
        .limit(5),
      supabase
        .from("red_voluntarios")
        .select("id, creado_el, tipo_ayuda")
        .order("creado_el", { ascending: false })
        .limit(5),
      supabase
        .from("acopio_mascotas")
        .select("id, creado_el")
        .order("creado_el", { ascending: false })
        .limit(5),
    ]);

    const items: ActivityItem[] = [];

    for (const mascota of mascotasResult.data ?? []) {
      const estado = getMascotaEstado(mascota);
      items.push({
        id: `mascota-${mascota.id}`,
        creado_el: mascota.creado_el,
        tipo: `Mascota ${MASCOTA_ESTADO_CONFIG[estado].label}`,
        genero: "a",
      });
    }

    for (const voluntario of voluntariosResult.data ?? []) {
      const meta = VOLUNTARIO_LABELS[voluntario.tipo_ayuda as TipoAyuda];
      if (!meta) continue;
      items.push({
        id: `voluntario-${voluntario.id}`,
        creado_el: voluntario.creado_el,
        tipo: meta.tipo,
        genero: meta.genero,
      });
    }

    for (const acopio of acopiosResult.data ?? []) {
      items.push({
        id: `acopio-${acopio.id}`,
        creado_el: acopio.creado_el,
        tipo: "Centro de acopio",
        genero: "o",
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime(),
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

export const fetchRecentActivity = unstable_cache(
  fetchRecentActivityUncached,
  ["recent-activity-ticker"],
  { revalidate: 30 },
);
