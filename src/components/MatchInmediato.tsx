import Image from "next/image";
import Link from "next/link";
import { getMascotaEstadoConfig } from "@/lib/mascota-estado";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MascotaReportada, TipoReporte } from "@/types/database";

function matchHeading(tipoReporte: TipoReporte): string {
  return tipoReporte === "PERDIDO"
    ? "Posibles mascotas encontradas en tu zona"
    : "Posibles mascotas perdidas en tu zona";
}

function MatchCard({ mascota }: { mascota: MascotaReportada }) {
  const estado = getMascotaEstadoConfig(mascota);
  const displayName = mascota.nombre_mascota?.trim() || mascota.especie;

  return (
    <li className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50">
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          {mascota.foto_url ? (
            <Image
              src={mascota.foto_url}
              alt={displayName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">
              🐾
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-zinc-900">{displayName}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${estado.badgeClass}`}
            >
              {estado.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600">
            {mascota.caracteristicas}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            {mascota.ubicacion_zona}
          </p>
        </div>
      </div>
      <div className="flex border-t border-amber-200/80">
        {mascota.contacto_whatsapp ? (
          <a
            href={buildWhatsAppUrl(mascota.contacto_whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 text-center text-xs font-semibold text-[#25D366] transition hover:bg-amber-100/80"
          >
            WhatsApp
          </a>
        ) : null}
        <a
          href={buildTelUrl(mascota.contacto_telefono)}
          className={`py-2 text-center text-xs font-semibold text-zinc-700 transition hover:bg-amber-100/80 ${
            mascota.contacto_whatsapp ? "flex-1 border-l border-amber-200/80" : "w-full"
          }`}
        >
          Llamar
        </a>
      </div>
    </li>
  );
}

export function MatchInmediato({
  matches,
  tipoReporte,
}: {
  matches: MascotaReportada[];
  tipoReporte: TipoReporte;
}) {
  if (matches.length === 0) return null;

  return (
    <section
      className="mt-6 rounded-xl border border-amber-200 bg-white p-4 text-left"
      aria-labelledby="match-inmediato-heading"
    >
      <h2
        id="match-inmediato-heading"
        className="text-base font-bold text-zinc-900"
      >
        Match Inmediato
      </h2>
      <p className="mt-1 text-sm text-zinc-600">{matchHeading(tipoReporte)}</p>
      <ul className="mt-4 space-y-3">
        {matches.map((mascota) => (
          <MatchCard key={mascota.id} mascota={mascota} />
        ))}
      </ul>
      <Link
        href="/"
        className="mt-4 block text-center text-sm font-medium text-amber-800 hover:underline"
      >
        Ver todos los reportes de mascotas
      </Link>
    </section>
  );
}
