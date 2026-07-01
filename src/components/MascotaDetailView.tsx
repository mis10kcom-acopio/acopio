import Link from "next/link";
import { RelativePublishedTime } from "@/components/RelativePublishedTime";
import { MascotaDetailCloseButton } from "@/components/MascotaDetailCloseButton";
import { MascotaContactActions } from "@/components/MascotaShareButton";
import { MascotaFotosCarousel } from "@/components/MascotaFotosCarousel";
import { getMascotaEstadoConfig } from "@/lib/mascota-estado";
import { getMascotaFotos } from "@/lib/mascota-fotos";

import type { MascotaReportada } from "@/types/database";

export function MascotaDetailView({
  mascota,
  showBackLink = true,
}: {
  mascota: MascotaReportada;
  showBackLink?: boolean;
}) {
  const estadoConfig = getMascotaEstadoConfig(mascota);
  const fotos = getMascotaFotos(mascota);

  return (
    <article className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-lg">
      <MascotaDetailCloseButton />

      {showBackLink ? (
        <div className="hidden border-b border-zinc-100 px-5 py-4 md:block">
          <Link
            href="/"
            className="text-sm font-medium text-amber-800 transition hover:text-amber-900"
          >
            ← Volver al listado
          </Link>
        </div>
      ) : null}

      <div className="relative">
        <MascotaFotosCarousel
          fotos={fotos}
          alt={mascota.nombre_mascota ?? "Mascota reportada"}
          imageClassName="aspect-square w-full object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
        <span
          className={`absolute top-4 left-4 z-10 rounded-full px-4 py-2 text-base font-bold text-white shadow-lg ${estadoConfig.badgeClass}`}
        >
          {estadoConfig.label}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 sm:text-3xl">
              {mascota.nombre_mascota?.trim() || "Mascota reportada"}
            </h1>
          </div>
          <RelativePublishedTime date={mascota.creado_el} />
        </div>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Características
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap sm:mt-2 sm:text-base">
            {mascota.caracteristicas}
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Zona / Municipio
          </h2>
          <p className="mt-1.5 text-base font-semibold text-zinc-900 sm:mt-2 sm:text-lg">
            {mascota.ubicacion_zona}
          </p>
        </section>

        <MascotaContactActions mascota={mascota} layout="card" />
      </div>
    </article>
  );
}
