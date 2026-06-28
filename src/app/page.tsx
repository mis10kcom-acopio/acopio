import { HomeHeader } from "@/components/HomeHeader";
import { HomePageContent } from "@/components/HomePageContent";
import { getSupabase } from "@/lib/supabase";
import type { HomePageData } from "@/types/database";

export const revalidate = 30;

async function fetchHomeData(): Promise<HomePageData> {
  const supabase = getSupabase();

  const [mascotasResult, voluntariosResult, acopiosResult] = await Promise.all([
    supabase
      .from("mascotas_reportadas")
      .select("*")
      .order("creado_el", { ascending: false }),
    supabase
      .from("red_voluntarios")
      .select("*")
      .eq("disponibilidad", "DISPONIBLE")
      .order("creado_el", { ascending: false }),
    supabase
      .from("acopio_mascotas")
      .select("*")
      .order("creado_el", { ascending: false }),
  ]);

  if (mascotasResult.error) {
    throw new Error(
      `Error al cargar mascotas: ${mascotasResult.error.message}`,
    );
  }
  if (voluntariosResult.error) {
    throw new Error(
      `Error al cargar voluntarios: ${voluntariosResult.error.message}`,
    );
  }
  if (acopiosResult.error) {
    throw new Error(`Error al cargar acopios: ${acopiosResult.error.message}`);
  }

  return {
    mascotas: mascotasResult.data ?? [],
    voluntarios: voluntariosResult.data ?? [],
    acopios: acopiosResult.data ?? [],
  };
}

export default async function HomePage() {
  let data: HomePageData;
  let fetchError: string | null = null;

  try {
    data = await fetchHomeData();
  } catch (error) {
    fetchError =
      error instanceof Error
        ? error.message
        : "No se pudo conectar con la base de datos.";
    data = { mascotas: [], voluntarios: [], acopios: [] };
  }

  return (
    <main className="bg-gradient-to-b from-amber-50 to-zinc-50">
      <HomeHeader />

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-0 sm:pt-10">
        {fetchError && (
          <div
            className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 text-base font-medium text-red-800"
            role="alert"
          >
            {fetchError}
          </div>
        )}
        <HomePageContent data={data} />
      </div>
    </main>
  );
}
