"use client";

import Image from "next/image";
import { useState } from "react";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type {
  AcopioMascota,
  HomePageData,
  MascotaReportada,
  RedVoluntario,
} from "@/types/database";

type TabId = "mascotas" | "voluntarios" | "acopio";

const TABS: { id: TabId; label: string }[] = [
  { id: "mascotas", label: "Mascotas" },
  { id: "voluntarios", label: "Red de Ayuda" },
  { id: "acopio", label: "Centros de Acopio" },
];

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

function ContactActions({
  telefono,
  whatsapp,
}: {
  telefono: string;
  whatsapp: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Teléfono
        </p>
        <a
          href={buildTelUrl(telefono)}
          className="text-base font-semibold text-amber-800 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
        >
          {telefono}
        </a>
      </div>
      {whatsapp && <WhatsAppButton telefono={whatsapp} />}
    </div>
  );
}

function WhatsAppButton({ telefono }: { telefono: string }) {
  return (
    <a
      href={buildWhatsAppUrl(telefono)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#1da851]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      WhatsApp
    </a>
  );
}

function MascotaCard({ mascota }: { mascota: MascotaReportada }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {mascota.foto_url && (
        <div className="relative aspect-video w-full bg-zinc-100">
          <Image
            src={mascota.foto_url}
            alt={mascota.nombre_mascota ?? `Mascota ${mascota.especie}`}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={mascota.tipo_reporte === "PERDIDO" ? "danger" : "success"}>
            {mascota.tipo_reporte === "PERDIDO" ? "Perdido" : "Encontrado"}
          </Badge>
          <Badge variant="info">{mascota.especie}</Badge>
        </div>
        {mascota.nombre_mascota && (
          <h3 className="text-lg font-semibold text-zinc-900">
            {mascota.nombre_mascota}
          </h3>
        )}
        <p className="text-sm text-zinc-600">{mascota.caracteristicas}</p>
        <div className="space-y-3 border-t border-zinc-100 pt-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Zona
            </p>
            <p className="font-medium text-zinc-800">{mascota.ubicacion_zona}</p>
          </div>
          <ContactActions
            telefono={mascota.contacto_telefono}
            whatsapp={mascota.contacto_whatsapp}
          />
        </div>
      </div>
    </article>
  );
}

function VoluntarioCard({ voluntario }: { voluntario: RedVoluntario }) {
  const tipoLabels: Record<RedVoluntario["tipo_ayuda"], string> = {
    VETERINARIO: "Veterinario",
    HOGAR_TEMPORAL: "Hogar Temporal",
    RESCATISTA: "Rescatista",
    TRANSPORTE: "Transporte",
  };

  const tipoVariants: Record<
    RedVoluntario["tipo_ayuda"],
    "info" | "success" | "warning" | "default"
  > = {
    VETERINARIO: "info",
    HOGAR_TEMPORAL: "success",
    RESCATISTA: "warning",
    TRANSPORTE: "default",
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={tipoVariants[voluntario.tipo_ayuda]}>
            {tipoLabels[voluntario.tipo_ayuda]}
          </Badge>
          <Badge variant="success">Disponible</Badge>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">
          {voluntario.nombre_o_clinica}
        </h3>
        <div className="space-y-3 border-t border-zinc-100 pt-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Zona
            </p>
            <p className="font-medium text-zinc-800">{voluntario.ubicacion_zona}</p>
          </div>
          <ContactActions
            telefono={voluntario.contacto_telefono}
            whatsapp={voluntario.contacto_whatsapp}
          />
        </div>
      </div>
    </article>
  );
}

function AcopioCard({ acopio }: { acopio: AcopioMascota }) {
  const stockVariants: Record<
    AcopioMascota["estado_stock"],
    "danger" | "warning" | "success"
  > = {
    CRITICO: "danger",
    MODERADO: "warning",
    ABASTECIDO: "success",
  };

  const stockLabels: Record<AcopioMascota["estado_stock"], string> = {
    CRITICO: "Stock Crítico",
    MODERADO: "Stock Moderado",
    ABASTECIDO: "Abastecido",
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={stockVariants[acopio.estado_stock]}>
            {stockLabels[acopio.estado_stock]}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">{acopio.nombre_centro}</h3>
        <p className="text-sm text-zinc-600">{acopio.direccion_exacta}</p>
        <p className="text-sm text-zinc-700">
          <span className="font-medium">Necesidades: </span>
          {acopio.necesidades_urgentes}
        </p>
        <div className="space-y-3 border-t border-zinc-100 pt-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Zona
            </p>
            <p className="font-medium text-zinc-800">{acopio.ubicacion_zona}</p>
          </div>
          <ContactActions
            telefono={acopio.contacto_telefono}
            whatsapp={acopio.contacto_whatsapp}
          />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-zinc-500">{message}</p>
    </div>
  );
}

export function HomePageContent({ data }: { data: HomePageData }) {
  const [activeTab, setActiveTab] = useState<TabId>("mascotas");

  return (
    <>
      <nav
        className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border"
        aria-label="Secciones principales"
      >
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-75">
                (
                {tab.id === "mascotas"
                  ? data.mascotas.length
                  : tab.id === "voluntarios"
                    ? data.voluntarios.length
                    : data.acopios.length}
                )
              </span>
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-6" role="tabpanel">
        {activeTab === "mascotas" && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">
              Mascotas Perdidas y Encontradas
            </h2>
            {data.mascotas.length === 0 ? (
              <EmptyState message="No hay reportes activos en este momento." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.mascotas.map((mascota) => (
                  <MascotaCard key={mascota.id} mascota={mascota} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "voluntarios" && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">
              Red de Veterinarios y Hogares de Paso
            </h2>
            {data.voluntarios.length === 0 ? (
              <EmptyState message="No hay voluntarios disponibles en este momento." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.voluntarios.map((voluntario) => (
                  <VoluntarioCard key={voluntario.id} voluntario={voluntario} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "acopio" && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">
              Centros de Acopio de Insumos
            </h2>
            {data.acopios.length === 0 ? (
              <EmptyState message="No hay centros de acopio registrados." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.acopios.map((acopio) => (
                  <AcopioCard key={acopio.id} acopio={acopio} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
