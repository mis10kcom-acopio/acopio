import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MascotaDetailView } from "@/components/MascotaDetailView";
import { getMascotaEstadoConfig } from "@/lib/mascota-estado";
import { getMascotaPrimaryFotoUrl } from "@/lib/mascota-fotos";
import { buildMascotaPublicUrl } from "@/lib/mascota-url";
import { getSupabase } from "@/lib/supabase";
import type { MascotaReportada } from "@/types/database";

export const revalidate = 30;

type PageProps = {
  params: Promise<{ id: string }>;
};

async function fetchMascotaById(id: string): Promise<MascotaReportada | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("mascotas_reportadas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al cargar la mascota: ${error.message}`);
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const mascota = await fetchMascotaById(id);
    if (!mascota) {
      return { title: "Mascota no encontrada | Huellas a Salvo" };
    }

    const estado = getMascotaEstadoConfig(mascota).label;
    const nombre = mascota.nombre_mascota?.trim() || "Mascota reportada";

    return {
      title: `${nombre} — ${estado} | Huellas a Salvo`,
      description: `${estado} en ${mascota.ubicacion_zona}. ${mascota.caracteristicas.slice(0, 140)}`,
      openGraph: {
        title: `${nombre} — ${estado}`,
        description: mascota.caracteristicas.slice(0, 200),
        url: buildMascotaPublicUrl(id),
        images: getMascotaPrimaryFotoUrl(mascota)
          ? [{ url: getMascotaPrimaryFotoUrl(mascota)! }]
          : undefined,
      },
    };
  } catch {
    return { title: "Mascota | Huellas a Salvo" };
  }
}

export default async function MascotaPublicPage({ params }: PageProps) {
  const { id } = await params;
  const mascota = await fetchMascotaById(id);

  if (!mascota) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-zinc-50">
      <div className="mx-auto max-w-2xl px-3 py-5 sm:px-4 sm:py-10">
        <MascotaDetailView mascota={mascota} />
      </div>
    </main>
  );
}
