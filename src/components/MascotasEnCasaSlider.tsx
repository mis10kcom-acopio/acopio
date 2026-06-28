"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Home, PawPrint } from "lucide-react";
import { useRef } from "react";
import type { MascotaReportada } from "@/types/database";

const SCROLL_STEP = 242;

function EnCasaSlide({ mascota }: { mascota: MascotaReportada }) {
  const label = mascota.nombre_mascota?.trim() || "Mascota en casa";

  return (
    <div className="relative shrink-0 snap-start" title={label}>
      <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full border-2 border-emerald-300 bg-white shadow-sm sm:h-[6.0625rem] sm:w-[6.0625rem]">
        {mascota.foto_url ? (
          <Image
            src={mascota.foto_url}
            alt={label}
            width={97}
            height={97}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600">
            <PawPrint className="h-9 w-9" aria-hidden />
          </div>
        )}
        <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
          <Home className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function MascotasEnCasaSlider({
  mascotas,
}: {
  mascotas: MascotaReportada[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (mascotas.length === 0) {
    return null;
  }

  function scrollByDirection(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="mt-8 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5"
      aria-labelledby="en-casa-slider-heading"
    >
      <div className="mb-4">
        <h3
          id="en-casa-slider-heading"
          className="text-lg font-bold text-emerald-900 sm:text-xl"
        >
          🏠 Ya están en casa
        </h3>
        <p className="mt-1 text-sm text-emerald-800/75">
          Cada foto es una historia con final feliz
        </p>
      </div>

      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByDirection("left")}
          className="hidden shrink-0 rounded-full border border-emerald-200 bg-white p-2 text-emerald-700 shadow-sm transition hover:bg-emerald-50 sm:inline-flex"
          aria-label="Ver mascotas anteriores"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Mascotas que ya están en casa"
        >
          {mascotas.map((mascota) => (
            <EnCasaSlide key={mascota.id} mascota={mascota} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByDirection("right")}
          className="hidden shrink-0 rounded-full border border-emerald-200 bg-white p-2 text-emerald-700 shadow-sm transition hover:bg-emerald-50 sm:inline-flex"
          aria-label="Ver más mascotas"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-emerald-700/70 sm:hidden">
        Desliza con el dedo para ver más
      </p>
    </section>
  );
}
