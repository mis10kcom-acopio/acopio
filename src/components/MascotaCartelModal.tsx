"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  composeMascotaStoryPoster,
  downloadMascotaStoryPoster,
  type MascotaPosterInput,
} from "@/lib/capture-card";

export function MascotaCartelModal({
  mascota,
  open,
  onClose,
}: {
  mascota: MascotaPosterInput;
  open: boolean;
  onClose: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setPosterBlob(null);

    composeMascotaStoryPoster(mascota)
      .then((blob) => {
        if (cancelled) return;
        setPosterBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (cancelled) return;
        setError("No se pudo generar el cartel. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    mascota.foto_url,
    mascota.foto_url_2,
    mascota.foto_url_3,
    mascota.nombre_mascota,
    mascota.ubicacion_zona,
    mascota.contacto_telefono,
    mascota.caracteristicas,
    mascota.estado,
    mascota.tipo_reporte,
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  function handleDownload() {
    if (!posterBlob) return;
    downloadMascotaStoryPoster(posterBlob);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartel-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2
            id="cartel-modal-title"
            className="text-base font-bold text-zinc-900"
          >
            Vista previa del cartel
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center overflow-y-auto bg-zinc-50 px-4 py-5">
          {loading ? (
            <div className="flex aspect-[3/4] w-full max-w-[280px] items-center justify-center rounded-xl bg-amber-50 text-sm font-medium text-amber-800">
              Generando cartel…
            </div>
          ) : error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Vista previa del cartel para compartir"
              className="aspect-[3/4] w-full max-w-[280px] rounded-xl border border-amber-200 bg-white object-contain shadow-md"
            />
          ) : null}

          <p className="mt-4 text-center text-xs text-zinc-500">
            Cartel de búsqueda 3:4 listo para compartir o imprimir.
          </p>
        </div>

        <div className="border-t border-zinc-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!posterBlob || loading}
            className="w-full rounded-xl bg-amber-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Descargar Cartel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function MascotaCartelButton({
  mascota,
  className = "",
  layout = "card",
}: {
  mascota: MascotaPosterInput & { id?: string };
  className?: string;
  layout?: "card" | "detail";
}) {
  const [open, setOpen] = useState(false);
  const isDetail = layout === "detail";

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex min-w-0 items-center justify-center rounded-lg border-2 border-amber-300 bg-amber-50 text-amber-900 shadow-sm transition hover:bg-amber-100 ${
          isDetail
            ? "min-h-[3rem] rounded-xl px-4 py-2.5 text-base font-bold"
            : "min-h-[2.5rem] w-full px-2 py-2 text-xs font-semibold leading-tight sm:min-h-[2.75rem] sm:px-3 sm:text-sm"
        } ${className}`}
      >
        📥 Cartel
      </button>
      <MascotaCartelModal
        mascota={mascota}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
