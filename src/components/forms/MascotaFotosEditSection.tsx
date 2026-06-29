"use client";

import Image from "next/image";
import { useState } from "react";
import type { MascotaReportada } from "@/types/database";

function FotoEditSlot({
  label,
  addLabel,
  currentUrl,
  fileFieldName,
  deleteFieldName,
}: {
  label: string;
  addLabel: string;
  currentUrl: string | null;
  fileFieldName: string;
  deleteFieldName: string;
}) {
  const [markedForDelete, setMarkedForDelete] = useState(false);
  const showCurrent = Boolean(currentUrl) && !markedForDelete;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm font-semibold text-zinc-800">{label}</p>

      {showCurrent ? (
        <div className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image
              src={currentUrl!}
              alt={label}
              width={320}
              height={320}
              className="aspect-square w-full max-w-[12rem] object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setMarkedForDelete(true)}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Eliminar foto
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">
          {currentUrl && markedForDelete
            ? "La foto se eliminará al guardar."
            : "Sin foto cargada."}
        </p>
      )}

      <div className="mt-3">
        <label
          htmlFor={fileFieldName}
          className="inline-flex cursor-pointer rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          {showCurrent ? `Cambiar ${label.toLowerCase()}` : addLabel}
        </label>
        <input
          id={fileFieldName}
          name={fileFieldName}
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-900"
        />
      </div>

      {markedForDelete ? (
        <>
          <input type="hidden" name={deleteFieldName} value="1" />
          <button
            type="button"
            onClick={() => setMarkedForDelete(false)}
            className="mt-2 text-sm font-medium text-amber-800 underline"
          >
            Deshacer eliminación
          </button>
        </>
      ) : null}
    </div>
  );
}

export function MascotaFotosEditSection({
  registro,
}: {
  registro: MascotaReportada;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div>
        <h3 className="text-base font-bold uppercase tracking-wide text-zinc-500">
          Fotos del reporte
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          Puedes tener hasta 3 fotos. La principal aparece primero en el listado.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FotoEditSlot
          label="Foto principal"
          addLabel="Agregar foto principal"
          currentUrl={registro.foto_url}
          fileFieldName="foto"
          deleteFieldName="eliminar_foto"
        />
        <FotoEditSlot
          label="Foto 2"
          addLabel="Agregar foto 2"
          currentUrl={registro.foto_url_2 ?? null}
          fileFieldName="foto_2"
          deleteFieldName="eliminar_foto_2"
        />
        <FotoEditSlot
          label="Foto 3"
          addLabel="Agregar foto 3"
          currentUrl={registro.foto_url_3 ?? null}
          fileFieldName="foto_3"
          deleteFieldName="eliminar_foto_3"
        />
      </div>
    </section>
  );
}
