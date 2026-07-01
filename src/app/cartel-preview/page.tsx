"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  composeMascotaStoryPosterClassic,
  composeMascotaStoryPosterV2,
  downloadBlob,
  type MascotaPosterInput,
} from "@/lib/capture-card";

const SAMPLE_MASCOTA: MascotaPosterInput = {
  foto_url:
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&h=900&q=80",
  foto_url_2: null,
  foto_url_3: null,
  estado: "PERDIDO",
  tipo_reporte: "PERDIDO",
  nombre_mascota: "Max",
  ubicacion_zona: "Los Palos Grandes, Caracas",
  caracteristicas:
    "Pastor alemán adulto, collar rojo, mancha blanca en oreja izquierda. Muy amigable pero asustadizo con ruidos fuertes.",
  contacto_telefono: "0414-1234567",
};

type PreviewVariant = {
  id: "v2" | "classic";
  title: string;
  description: string;
  badge: string;
  compose: (data: MascotaPosterInput) => Promise<Blob>;
};

const VARIANTS: PreviewVariant[] = [
  {
    id: "v2",
    title: "Nuevo — cartel de búsqueda",
    description:
      "Banda de urgencia, foto enmarcada, nombre destacado, zona resaltada, teléfono con llamada a la acción.",
    badge: "Activo en la app",
    compose: composeMascotaStoryPosterV2,
  },
  {
    id: "classic",
    title: "Actual — ficha móvil",
    description:
      "Diseño anterior alineado con la vista de detalle en móvil.",
    badge: "Respaldo",
    compose: composeMascotaStoryPosterClassic,
  },
];

function CartelPreviewCard({ variant }: { variant: PreviewVariant }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setBlob(null);

    variant
      .compose(SAMPLE_MASCOTA)
      .then((result) => {
        if (cancelled) return;
        setBlob(result);
        setPreviewUrl(URL.createObjectURL(result));
      })
      .catch(() => {
        if (cancelled) return;
        setError("No se pudo generar la vista previa.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [variant]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <article className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white shadow-md">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-900">{variant.title}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              variant.id === "v2"
                ? "bg-amber-100 text-amber-900"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {variant.badge}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-600">{variant.description}</p>
      </div>

      <div className="flex flex-1 flex-col items-center bg-zinc-50 px-5 py-6">
        {loading ? (
          <div className="flex aspect-[3/4] w-full max-w-[320px] items-center justify-center rounded-xl bg-amber-50 text-sm font-medium text-amber-800">
            Generando…
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`Vista previa ${variant.title}`}
            className="aspect-[3/4] w-full max-w-[320px] rounded-xl border border-zinc-200 bg-white object-contain shadow-lg"
          />
        ) : null}
      </div>

      <div className="border-t border-zinc-100 px-5 py-4">
        <button
          type="button"
          disabled={!blob || loading}
          onClick={() => {
            if (!blob) return;
            downloadBlob(blob, `cartel-${variant.id}-max.jpg`);
          }}
          className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Descargar ejemplo
        </button>
      </div>
    </article>
  );
}

export default function CartelPreviewPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF2] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-3">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-amber-800 hover:text-amber-900"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            Comparativa de carteles
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Mismo contenido (Max, perdido en Los Palos Grandes). El diseño
            nuevo prioriza la urgencia de búsqueda: banda de estado, zona
            resaltada y teléfono más visible. El botón{" "}
            <strong className="font-semibold text-zinc-800">Cartel</strong> en
            las tarjetas ya usa la versión nueva. Si prefieren el anterior, lo
            revertimos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {VARIANTS.map((variant) => (
            <CartelPreviewCard key={variant.id} variant={variant} />
          ))}
        </div>
      </div>
    </main>
  );
}
