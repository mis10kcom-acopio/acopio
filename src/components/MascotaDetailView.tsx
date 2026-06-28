import Image from "next/image";
import Link from "next/link";
import { RelativePublishedTime } from "@/components/RelativePublishedTime";
import { MascotaContactActions } from "@/components/MascotaShareButton";
import { getMascotaEstadoConfig } from "@/lib/mascota-estado";

import type { MascotaReportada } from "@/types/database";

export function MascotaDetailView({
  mascota,
  showBackLink = true,
}: {
  mascota: MascotaReportada;
  showBackLink?: boolean;
}) {
  const estadoConfig = getMascotaEstadoConfig(mascota);

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-lg">
      {showBackLink ? (
        <div className="border-b border-zinc-100 px-5 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-amber-800 transition hover:text-amber-900"
          >
            ← Volver al listado
          </Link>
        </div>
      ) : null}

      <div className="relative">
        {mascota.foto_url ? (
          <Image
            src={mascota.foto_url}
            alt={mascota.nombre_mascota ?? "Mascota reportada"}
            width={900}
            height={900}
            className="aspect-square w-full object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 720px"
          />
        ) : (
          <div className="aspect-square w-full bg-zinc-100" />
        )}
        <span
          className={`absolute top-4 left-4 z-10 rounded-full px-4 py-2 text-base font-bold text-white shadow-lg ${estadoConfig.badgeClass}`}
        >
          {estadoConfig.label}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              {mascota.nombre_mascota?.trim() || "Mascota reportada"}
            </h1>
          </div>
          <RelativePublishedTime date={mascota.creado_el} />
        </div>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Características
          </h2>
          <p className="mt-2 text-base leading-relaxed text-zinc-700 whitespace-pre-wrap">
            {mascota.caracteristicas}
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Zona / Municipio
          </h2>
          <p className="mt-2 text-lg font-semibold text-zinc-900">
            {mascota.ubicacion_zona}
          </p>
        </section>

        <MascotaContactActions mascota={mascota} layout="detail" />
      </div>
    </article>
  );
}
