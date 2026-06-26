import Link from "next/link";
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
      .eq("estado", "ACTIVO")
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
    <main className="min-h-screen bg-amber-50">
      <header className="border-b border-amber-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              🐾
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Huellas a Salvo
              </h1>
              <p className="mt-1 text-sm text-zinc-600 sm:text-base">
                Plataforma de emergencia para animales — Venezuela
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-zinc-500">
            Reporta mascotas perdidas o encontradas, encuentra ayuda veterinaria
            y hogares temporales, o localiza centros de acopio de insumos.
            Actualizado cada 30 segundos.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/reportar-mascota"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              📢 Reportar Mascota
            </Link>
            <Link
              href="/registro-voluntario"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              🤝 Ofrecer Ayuda/Hogar
            </Link>
            <Link
              href="/registro-acopio"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              🏥 Registrar Acopio
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {fetchError && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {fetchError}
          </div>
        )}
        <HomePageContent data={data} />
      </div>

      <footer className="border-t border-amber-200 bg-white py-6 text-center text-xs text-zinc-500">
        Huellas a Salvo — Hecho con amor para los animales afectados por el sismo
      </footer>
    </main>
  );
}
