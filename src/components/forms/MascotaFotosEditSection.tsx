"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  eliminarFotoMascotaEdicion,
  subirFotoMascotaEdicion,
} from "@/actions/editar";
import { ACCEPTED_IMAGE_INPUT } from "@/lib/storage-upload";
import type { MascotaReportada } from "@/types/database";

function FotoEditSlot({
  identificador,
  initialUrl,
}: {
  identificador: string;
  initialUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = uploading || deleting;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    const result = await subirFotoMascotaEdicion(identificador, formData);

    setUploading(false);

    if (result.ok) {
      setCurrentUrl(result.url);
    } else {
      setError(result.error);
    }
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);

    const result = await eliminarFotoMascotaEdicion(identificador);

    setDeleting(false);

    if (result.ok) {
      setCurrentUrl(null);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm font-semibold text-zinc-800">Foto del reporte</p>

      {currentUrl ? (
        <div className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image
              src={currentUrl}
              alt="Foto del reporte"
              width={320}
              height={320}
              className="aspect-square w-full max-w-[12rem] object-cover"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Subiendo…
                </>
              ) : (
                "Cambiar foto"
              )}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Eliminando…
                </span>
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Sin foto cargada.</p>
      )}

      {!currentUrl ? (
        <div className="mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Subiendo…
              </>
            ) : (
              "Agregar foto"
            )}
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_INPUT}
        className="sr-only"
        onChange={handleFileChange}
        disabled={busy}
      />

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function MascotaFotosEditSection({
  identificador,
  registro,
}: {
  identificador: string;
  registro: MascotaReportada;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div>
        <h3 className="text-base font-bold uppercase tracking-wide text-zinc-500">
          Foto del reporte
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          Una sola foto por reporte (JPG, PNG o WebP, máximo 5 MB). Se guarda al
          seleccionarla; no hace falta pulsar &quot;Guardar cambios&quot;.
        </p>
      </div>

      <FotoEditSlot
        identificador={identificador}
        initialUrl={registro.foto_url}
      />
    </section>
  );
}
