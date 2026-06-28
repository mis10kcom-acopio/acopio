"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollHideBar } from "@/lib/use-scroll-hide-bar";

export function MascotasPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const visible = useScrollHideBar();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <>
      <div
        className="pointer-events-none h-16 sm:h-[4.5rem]"
        aria-hidden
      />
      <nav
        className={`fixed left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-transform duration-300 ease-in-out bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:translate-y-0 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-label="Paginación de mascotas"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página anterior"
            tabIndex={visible ? 0 : -1}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <span className="min-w-[7rem] text-center text-sm font-semibold text-zinc-700">
            Página {page} de {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página siguiente"
            tabIndex={visible ? 0 : -1}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </nav>
    </>
  );
}

export const MASCOTAS_PER_PAGE_MOBILE = 9;
export const MASCOTAS_PER_PAGE_DESKTOP = 12;
