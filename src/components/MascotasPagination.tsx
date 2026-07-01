"use client";

export const MASCOTAS_PER_PAGE = 50;

export function MascotasLoadMore({
  visibleCount,
  totalCount,
  onLoadMore,
}: {
  visibleCount: number;
  totalCount: number;
  onLoadMore: () => void;
}) {
  if (visibleCount >= totalCount) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        className="rounded-xl border-2 border-amber-300 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100 sm:text-base"
        aria-label={`Ver más mascotas. Mostrando ${visibleCount} de ${totalCount}`}
      >
        Ver más
      </button>
    </div>
  );
}
