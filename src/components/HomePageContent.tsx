"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MascotasEnCasaSlider } from "@/components/MascotasEnCasaSlider";
import { EspecieFilterPills } from "@/components/EspecieFilterPills";
import { AcopioStockFilterPills } from "@/components/AcopioStockFilterPills";
import {
  MascotaEstadoFilterPills,
  type MascotaEstadoFilterId,
} from "@/components/MascotaEstadoFilterPills";
import { MascotaContactActions } from "@/components/MascotaShareButton";
import {
  MASCOTAS_PER_PAGE_DESKTOP,
  MASCOTAS_PER_PAGE_MOBILE,
  MascotasPagination,
} from "@/components/MascotasPagination";
import { useIsXlUp } from "@/lib/use-media-query";
import { scrollToElement } from "@/lib/use-scroll-hide-bar";
import { RelativePublishedTime } from "@/components/RelativePublishedTime";
import { VenezuelaLocalClock } from "@/components/VenezuelaLocalClock";
import {
  Home,
  PawPrint,
  PersonStanding,
  Search,
  Stethoscope,
  Truck,
  Warehouse,
} from "lucide-react";
import { getMascotaEstado, getMascotaEstadoConfig, isMascotaEstadoActivo } from "@/lib/mascota-estado";
import { buildMascotaPublicPath } from "@/lib/mascota-url";
import { filterMascotasByEspecie, type EspecieFilterId } from "@/lib/mascota-especie";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type {
  AcopioMascota,
  EstadoStock,
  HomePageData,
  MascotaReportada,
  RedVoluntario,
  TipoAyuda,
} from "@/types/database";

type SectionId = "mascotas" | "red-ayuda" | "veterinarios" | "acopio";

type NavCardId =
  | "mascotas"
  | "veterinarios"
  | "acopio"
  | "hogar-temporal"
  | "rescatista"
  | "transporte";

type RedAyudaTipoFilter = Extract<
  TipoAyuda,
  "HOGAR_TEMPORAL" | "RESCATISTA" | "TRANSPORTE"
>;

type NavCard = {
  id: NavCardId;
  label: string;
  subtitle: string;
  icon: typeof PawPrint;
  accent: string;
  activeRing: string;
  section: SectionId;
  redAyudaFilter?: RedAyudaTipoFilter;
};

function ClearFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
    >
      Limpiar filtro
    </button>
  );
}

const TIPOS_RED_AYUDA: TipoAyuda[] = [
  "HOGAR_TEMPORAL",
  "RESCATISTA",
  "TRANSPORTE",
];

const NAV_ROW_1: NavCard[] = [
  {
    id: "mascotas",
    label: "Mascotas",
    subtitle: "Perdidas y encontradas",
    icon: PawPrint,
    accent: "text-amber-700",
    activeRing: "ring-amber-500",
    section: "mascotas",
  },
  {
    id: "veterinarios",
    label: "Veterinarios",
    subtitle: "Clínicas y atención médica",
    icon: Stethoscope,
    accent: "text-sky-700",
    activeRing: "ring-sky-500",
    section: "veterinarios",
  },
  {
    id: "acopio",
    label: "Centros de Acopio",
    subtitle: "Insumos y donaciones",
    icon: Warehouse,
    accent: "text-orange-700",
    activeRing: "ring-orange-500",
    section: "acopio",
  },
];

const NAV_ROW_2: NavCard[] = [
  {
    id: "hogar-temporal",
    label: "Hogares Temporales",
    subtitle: "Familias que reciben mascotas",
    icon: Home,
    accent: "text-emerald-700",
    activeRing: "ring-emerald-500",
    section: "red-ayuda",
    redAyudaFilter: "HOGAR_TEMPORAL",
  },
  {
    id: "rescatista",
    label: "Rescatistas",
    subtitle: "Personas en terreno",
    icon: PersonStanding,
    accent: "text-amber-700",
    activeRing: "ring-amber-500",
    section: "red-ayuda",
    redAyudaFilter: "RESCATISTA",
  },
  {
    id: "transporte",
    label: "Transporte",
    subtitle: "Traslado de animales",
    icon: Truck,
    accent: "text-zinc-700",
    activeRing: "ring-zinc-500",
    section: "red-ayuda",
    redAyudaFilter: "TRANSPORTE",
  },
];

const NAV_CARDS: NavCard[] = [...NAV_ROW_1, ...NAV_ROW_2];

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-zinc-100 text-zinc-800",
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-900",
    info: "bg-sky-100 text-sky-900",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${variants[variant]}`}
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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Teléfono
        </p>
        <a
          href={buildTelUrl(telefono)}
          className="text-lg font-bold text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950"
        >
          {telefono}
        </a>
      </div>
      {whatsapp && (
        <a
          href={buildWhatsAppUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-[#1da851]"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}

function MascotaCard({ mascota }: { mascota: MascotaReportada }) {
  const estadoConfig = getMascotaEstadoConfig(mascota);

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-md transition hover:border-zinc-300 hover:shadow-lg">
      <Link href={buildMascotaPublicPath(mascota.id)} className="block bg-white">
        <div className="relative">
          {mascota.foto_url ? (
            <Image
              src={mascota.foto_url}
              alt={mascota.nombre_mascota ?? "Mascota reportada"}
              width={600}
              height={600}
              crossOrigin="anonymous"
              className="aspect-square w-full rounded-t-2xl object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="aspect-square w-full rounded-t-2xl bg-zinc-100" />
          )}
          <span
            className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 text-base font-bold text-white shadow-lg ${estadoConfig.badgeClass}`}
          >
            {estadoConfig.label}
          </span>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            {mascota.nombre_mascota ? (
              <h3 className="text-xl font-bold text-zinc-900">
                {mascota.nombre_mascota}
              </h3>
            ) : (
              <span className="sr-only">Mascota reportada</span>
            )}
            <RelativePublishedTime date={mascota.creado_el} />
          </div>
          <p className="line-clamp-3 text-base leading-relaxed text-zinc-700">
            {mascota.caracteristicas}
          </p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Zona
            </p>
            <p className="text-lg font-semibold text-zinc-900">
              {mascota.ubicacion_zona}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <MascotaContactActions mascota={mascota} />
      </div>
    </article>
  );
}

function VoluntarioCard({ voluntario }: { voluntario: RedVoluntario }) {
  const tipoLabels: Record<RedVoluntario["tipo_ayuda"], string> = {
    VETERINARIO: "Veterinario / Clínica",
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

  const esVeterinario = voluntario.tipo_ayuda === "VETERINARIO";

  return (
    <article className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-md">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {voluntario.foto_url ? (
            <Image
              src={voluntario.foto_url}
              alt={`Logo de ${voluntario.nombre_o_clinica}`}
              width={72}
              height={72}
              crossOrigin="anonymous"
              className={`h-16 w-16 shrink-0 border-2 border-zinc-100 object-cover shadow-sm ${
                esVeterinario ? "rounded-full" : "rounded-xl"
              }`}
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={tipoVariants[voluntario.tipo_ayuda]}>
                {tipoLabels[voluntario.tipo_ayuda]}
              </Badge>
              <Badge variant="success">Disponible</Badge>
            </div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-xl font-bold text-zinc-900">
                {voluntario.nombre_o_clinica}
              </h3>
              <RelativePublishedTime date={voluntario.creado_el} />
            </div>
          </div>
        </div>
        <div className="space-y-4 border-t-2 border-zinc-100 pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Zona
            </p>
            <p className="text-lg font-semibold text-zinc-900">
              {voluntario.ubicacion_zona}
            </p>
          </div>
          <ContactActions
            telefono={voluntario.contacto_telefono}
            whatsapp={voluntario.contacto_whatsapp}
          />
          {voluntario.informacion_adicional ? (
            <div className="rounded-xl bg-amber-50/80 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800/80">
                Información adicional
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700">
                {voluntario.informacion_adicional}
              </p>
            </div>
          ) : null}
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
    <article className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-md">
      <div className="space-y-4">
        <Badge variant={stockVariants[acopio.estado_stock]}>
          {stockLabels[acopio.estado_stock]}
        </Badge>
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-xl font-bold text-zinc-900">
            {acopio.nombre_centro}
          </h3>
          <RelativePublishedTime date={acopio.creado_el} />
        </div>
        <p className="text-base text-zinc-700">{acopio.direccion_exacta}</p>
        <p className="text-base text-zinc-800">
          <span className="font-bold">Necesidades: </span>
          {acopio.necesidades_urgentes}
        </p>
        <div className="space-y-4 border-t-2 border-zinc-100 pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Zona
            </p>
            <p className="text-lg font-semibold text-zinc-900">
              {acopio.ubicacion_zona}
            </p>
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
    <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
      <p className="text-base font-medium text-zinc-600">{message}</p>
    </div>
  );
}

function ZoneSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  wrapperClassName = "mb-5",
  sticky = false,
  footer,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  wrapperClassName?: string;
  sticky?: boolean;
  footer?: React.ReactNode;
}) {
  const field = (
    <>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-xl border-2 border-zinc-200 bg-white py-3.5 pl-12 pr-4 text-base text-zinc-900 shadow-sm placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      />
    </>
  );

  if (sticky) {
    return (
      <div
        className={`sticky top-9 z-40 -mx-4 border-b border-amber-200/60 bg-amber-50 px-4 py-2 shadow-sm ${wrapperClassName}`}
      >
        <div className="relative">{field}</div>
        {footer}
      </div>
    );
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      {field}
      {footer}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-5 text-2xl font-bold text-zinc-900">{title}</h2>
  );
}

function filterByZona<T extends { ubicacion_zona: string }>(
  items: T[],
  searchQuery: string,
): T[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) =>
    item.ubicacion_zona.toLowerCase().includes(query),
  );
}

export function HomePageContent({ data }: { data: HomePageData }) {
  const [activeSection, setActiveSection] = useState<SectionId>("mascotas");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryRedAyuda, setSearchQueryRedAyuda] = useState("");
  const [searchQueryVeterinarios, setSearchQueryVeterinarios] = useState("");
  const [searchQueryAcopio, setSearchQueryAcopio] = useState("");
  const [especieFilter, setEspecieFilter] = useState<EspecieFilterId | null>(
    null,
  );
  const [mascotaEstadoFilter, setMascotaEstadoFilter] =
    useState<MascotaEstadoFilterId | null>(null);
  const [redAyudaTipoFilter, setRedAyudaTipoFilter] =
    useState<RedAyudaTipoFilter | null>(null);
  const [acopioStockFilters, setAcopioStockFilters] = useState<EstadoStock[]>(
    [],
  );
  const [mascotaPage, setMascotaPage] = useState(1);
  const mascotasCardsRef = useRef<HTMLDivElement>(null);
  const sectionContentRef = useRef<HTMLDivElement>(null);
  const shouldScrollToCardsRef = useRef(false);
  const shouldScrollToSectionRef = useRef(false);
  const isXlUp = useIsXlUp();
  const mascotasPerPage = isXlUp
    ? MASCOTAS_PER_PAGE_DESKTOP
    : MASCOTAS_PER_PAGE_MOBILE;

  const redAyuda = useMemo(
    () =>
      data.voluntarios.filter((v) =>
        TIPOS_RED_AYUDA.includes(v.tipo_ayuda),
      ),
    [data.voluntarios],
  );

  const veterinarios = useMemo(
    () => data.voluntarios.filter((v) => v.tipo_ayuda === "VETERINARIO"),
    [data.voluntarios],
  );

  const activeMascotas = useMemo(
    () =>
      data.mascotas.filter((mascota) =>
        isMascotaEstadoActivo(getMascotaEstado(mascota)),
      ),
    [data.mascotas],
  );

  const resolvedMascotas = useMemo(
    () =>
      data.mascotas.filter(
        (mascota) => getMascotaEstado(mascota) === "EN_CASA",
      ),
    [data.mascotas],
  );

  const mascotasForList = useMemo(() => {
    if (!mascotaEstadoFilter) return activeMascotas;
    return activeMascotas.filter(
      (mascota) => getMascotaEstado(mascota) === mascotaEstadoFilter,
    );
  }, [activeMascotas, mascotaEstadoFilter]);

  const filteredMascotas = useMemo(() => {
    const byZona = filterByZona(mascotasForList, searchQuery);
    return filterMascotasByEspecie(byZona, especieFilter);
  }, [mascotasForList, searchQuery, especieFilter]);

  const enCasaForSlider = useMemo(() => {
    const byZona = filterByZona(resolvedMascotas, searchQuery);
    return filterMascotasByEspecie(byZona, especieFilter);
  }, [resolvedMascotas, searchQuery, especieFilter]);

  const totalMascotaPages = Math.max(
    1,
    Math.ceil(filteredMascotas.length / mascotasPerPage),
  );

  const safeMascotaPage = Math.min(mascotaPage, totalMascotaPages);

  const paginatedMascotas = useMemo(() => {
    const start = (safeMascotaPage - 1) * mascotasPerPage;
    return filteredMascotas.slice(start, start + mascotasPerPage);
  }, [filteredMascotas, safeMascotaPage, mascotasPerPage]);

  useEffect(() => {
    setMascotaPage(1);
  }, [searchQuery, especieFilter, mascotaEstadoFilter, mascotasPerPage]);

  useEffect(() => {
    if (!shouldScrollToCardsRef.current) return;
    shouldScrollToCardsRef.current = false;
    scrollToElement(mascotasCardsRef.current, 96);
  }, [safeMascotaPage]);

  useEffect(() => {
    if (!shouldScrollToSectionRef.current) return;
    shouldScrollToSectionRef.current = false;
    sectionContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function handleMascotaPageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalMascotaPages || nextPage === safeMascotaPage) {
      return;
    }
    shouldScrollToCardsRef.current = true;
    setMascotaPage(nextPage);
  }

  const filteredRedAyuda = useMemo(() => {
    const byTipo = redAyudaTipoFilter
      ? redAyuda.filter((v) => v.tipo_ayuda === redAyudaTipoFilter)
      : redAyuda;
    return filterByZona(byTipo, searchQueryRedAyuda);
  }, [redAyuda, redAyudaTipoFilter, searchQueryRedAyuda]);

  const filteredVeterinarios = useMemo(
    () => filterByZona(veterinarios, searchQueryVeterinarios),
    [veterinarios, searchQueryVeterinarios],
  );

  const filteredAcopios = useMemo(() => {
    const byStock =
      acopioStockFilters.length > 0
        ? data.acopios.filter((acopio) =>
            acopioStockFilters.includes(acopio.estado_stock),
          )
        : data.acopios;
    return filterByZona(byStock, searchQueryAcopio);
  }, [data.acopios, acopioStockFilters, searchQueryAcopio]);

  const mascotaStats = useMemo(
    () => ({
      perdidas: data.mascotas.filter((m) => getMascotaEstado(m) === "PERDIDO")
        .length,
      enResguardo: data.mascotas.filter(
        (m) => getMascotaEstado(m) === "EN_RESGUARDO",
      ).length,
      adopcion: data.mascotas.filter((m) => getMascotaEstado(m) === "ADOPCION")
        .length,
      enCasa: data.mascotas.filter((m) => getMascotaEstado(m) === "EN_CASA")
        .length,
    }),
    [data.mascotas],
  );

  const redAyudaStats = useMemo(
    () => ({
      hogar: redAyuda.filter((v) => v.tipo_ayuda === "HOGAR_TEMPORAL").length,
      rescatista: redAyuda.filter((v) => v.tipo_ayuda === "RESCATISTA").length,
      transporte: redAyuda.filter((v) => v.tipo_ayuda === "TRANSPORTE").length,
    }),
    [redAyuda],
  );

  const acopioStats = useMemo(
    () => ({
      critico: data.acopios.filter((a) => a.estado_stock === "CRITICO").length,
      moderado: data.acopios.filter((a) => a.estado_stock === "MODERADO").length,
      abastecido: data.acopios.filter((a) => a.estado_stock === "ABASTECIDO")
        .length,
    }),
    [data.acopios],
  );

  function isNavCardActive(card: NavCard): boolean {
    if (activeSection !== card.section) return false;
    if (card.redAyudaFilter) {
      return redAyudaTipoFilter === card.redAyudaFilter;
    }
    return true;
  }

  function handleNavCardClick(card: NavCard) {
    setActiveSection(card.section);

    if (card.redAyudaFilter) {
      setRedAyudaTipoFilter((current) =>
        current === card.redAyudaFilter ? null : card.redAyudaFilter ?? null,
      );
    } else {
      setRedAyudaTipoFilter(null);
    }

    shouldScrollToSectionRef.current = true;
  }

  function renderNavCardStats(cardId: NavCardId) {
    switch (cardId) {
      case "mascotas":
        return (
          <p className="mt-2 text-sm font-semibold leading-snug text-zinc-700">
            <span className="text-red-600">{mascotaStats.perdidas} Perdidas</span>
            {" | "}
            <span className="text-yellow-600">
              {mascotaStats.enResguardo} En Resguardo
            </span>
            {" | "}
            <span className="text-blue-600">{mascotaStats.adopcion} Adopción</span>
            {" | "}
            <span className="text-emerald-600">{mascotaStats.enCasa} En Casa</span>
          </p>
        );
      case "veterinarios":
        return (
          <p className="mt-2 text-sm font-semibold text-sky-800">
            {veterinarios.length} disponibles
          </p>
        );
      case "acopio":
        return (
          <p className="mt-2 text-sm font-semibold leading-snug text-zinc-700">
            {acopioStats.critico} Crítico 🔴 | {acopioStats.moderado} Moderado 🟡
            | {acopioStats.abastecido} Abastecido 🟢
          </p>
        );
      case "hogar-temporal":
        return (
          <p className="mt-2 text-sm font-semibold text-emerald-800">
            {redAyudaStats.hogar} disponibles
          </p>
        );
      case "rescatista":
        return (
          <p className="mt-2 text-sm font-semibold text-amber-800">
            {redAyudaStats.rescatista} disponibles
          </p>
        );
      case "transporte":
        return (
          <p className="mt-2 text-sm font-semibold text-zinc-700">
            {redAyudaStats.transporte} disponibles
          </p>
        );
    }
  }

  function renderNavCard(card: NavCard) {
    const Icon = card.icon;
    const isActive = isNavCardActive(card);

    return (
      <button
        key={card.id}
        type="button"
        onClick={() => handleNavCardClick(card)}
        aria-pressed={isActive}
        className={`flex h-full min-h-[9.5rem] flex-col items-start justify-between rounded-2xl border-2 bg-white p-4 text-left shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 sm:p-5 ${
          isActive
            ? `border-zinc-900 ${card.activeRing} ring-2 ring-offset-2`
            : "border-zinc-200 hover:border-zinc-300 hover:shadow-xl"
        }`}
      >
        <Icon className={`h-7 w-7 shrink-0 ${card.accent}`} aria-hidden />
        <div className="mt-3 flex w-full flex-1 flex-col justify-end">
          <p className="text-base font-bold leading-tight text-zinc-900 sm:text-lg">
            {card.label}
          </p>
          {renderNavCardStats(card.id)}
          <p className="mt-1.5 text-xs font-medium leading-snug text-zinc-500">
            {card.subtitle}
          </p>
        </div>
      </button>
    );
  }

  return (
    <>
      <VenezuelaLocalClock />
      <nav
        className="grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 [&>*]:h-full"
        aria-label="Secciones y estadísticas"
      >
        {NAV_CARDS.map(renderNavCard)}
      </nav>

      <div
        ref={sectionContentRef}
        className="mt-8 scroll-mt-24"
        role="region"
      >
        {activeSection === "mascotas" && (
          <section>
            <SectionHeader title="Mascotas Perdidas, En Resguardo y Adopción" />
            {data.mascotas.length > 0 ? (
              <ZoneSearchInput
                sticky
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="🔍 Buscar por Zona"
                ariaLabel="Buscar mascotas por zona, ciudad o municipio"
                footer={
                  <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <EspecieFilterPills
                      value={especieFilter}
                      onChange={setEspecieFilter}
                      className="mt-0"
                    />
                    <MascotaEstadoFilterPills
                      value={mascotaEstadoFilter}
                      onChange={setMascotaEstadoFilter}
                      className="lg:justify-end"
                    />
                  </div>
                }
              />
            ) : null}
            {data.mascotas.length === 0 ? (
              <EmptyState message="No hay reportes activos en este momento." />
            ) : filteredMascotas.length === 0 ? (
              <EmptyState message="No hay resultados con los filtros seleccionados." />
            ) : (
              <>
                <div
                  ref={mascotasCardsRef}
                  className="scroll-mt-24"
                  id="mascotas-cards"
                >
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {paginatedMascotas.map((mascota) => (
                      <MascotaCard key={mascota.id} mascota={mascota} />
                    ))}
                  </div>
                </div>
                <MascotasPagination
                  page={safeMascotaPage}
                  totalPages={totalMascotaPages}
                  onPageChange={handleMascotaPageChange}
                />
                <MascotasEnCasaSlider mascotas={enCasaForSlider} />
              </>
            )}
          </section>
        )}

        {activeSection === "red-ayuda" && (
          <section>
            <SectionHeader title="Red de Ayuda — Hogares, Rescatistas y Transporte" />
            {redAyuda.length > 0 ? (
              <ZoneSearchInput
                sticky
                value={searchQueryRedAyuda}
                onChange={setSearchQueryRedAyuda}
                placeholder="🔍 Buscar por Zona"
                ariaLabel="Buscar voluntarios por zona"
              />
            ) : null}
            {redAyuda.length === 0 ? (
              <EmptyState message="No hay voluntarios de ayuda disponibles en este momento." />
            ) : filteredRedAyuda.length === 0 ? (
              <div className="text-center">
                <EmptyState message="No hay voluntarios con los filtros seleccionados." />
                {redAyudaTipoFilter ? (
                  <ClearFilterButton
                    onClick={() => setRedAyudaTipoFilter(null)}
                  />
                ) : null}
              </div>
            ) : (
              <>
                {redAyudaTipoFilter ? (
                  <div className="mb-4 flex justify-end">
                    <ClearFilterButton
                      onClick={() => setRedAyudaTipoFilter(null)}
                    />
                  </div>
                ) : null}
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRedAyuda.map((voluntario) => (
                  <VoluntarioCard key={voluntario.id} voluntario={voluntario} />
                ))}
              </div>
              </>
            )}
          </section>
        )}

        {activeSection === "veterinarios" && (
          <section>
            <SectionHeader title="Veterinarios y Clínicas Disponibles" />
            {veterinarios.length > 0 ? (
              <ZoneSearchInput
                sticky
                value={searchQueryVeterinarios}
                onChange={setSearchQueryVeterinarios}
                placeholder="🔍 Buscar por Zona"
                ariaLabel="Buscar veterinarios por zona"
              />
            ) : null}
            {veterinarios.length === 0 ? (
              <EmptyState message="No hay veterinarios disponibles en este momento." />
            ) : filteredVeterinarios.length === 0 ? (
              <EmptyState message="No hay veterinarios registrados en esta zona actualmente." />
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVeterinarios.map((voluntario) => (
                  <VoluntarioCard key={voluntario.id} voluntario={voluntario} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "acopio" && (
          <section>
            <SectionHeader title="Centros de Acopio de Insumos" />
            {data.acopios.length > 0 ? (
              <ZoneSearchInput
                sticky
                value={searchQueryAcopio}
                onChange={setSearchQueryAcopio}
                placeholder="🔍 Buscar por Zona"
                ariaLabel="Buscar centros de acopio por zona"
                footer={
                  <AcopioStockFilterPills
                    value={acopioStockFilters}
                    onChange={setAcopioStockFilters}
                  />
                }
              />
            ) : null}
            {data.acopios.length === 0 ? (
              <EmptyState message="No hay centros de acopio registrados." />
            ) : filteredAcopios.length === 0 ? (
              <EmptyState message="No hay centros de acopio con los filtros seleccionados." />
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAcopios.map((acopio) => (
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
