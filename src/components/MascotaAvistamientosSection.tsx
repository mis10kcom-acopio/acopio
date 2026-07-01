"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { publicarAvistamiento } from "@/actions/avistamientos";
import { RelativePublishedTime } from "@/components/RelativePublishedTime";
import { AVISTAMIENTO_COMENTARIO_MAX_LENGTH } from "@/lib/avistamiento-security";
import {
  initialAvistamientoActionState,
  type AvistamientoActionState,
} from "@/types/actions";
import type { Avistamiento } from "@/types/database";

const PREVIEW_COUNT = 3;

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

const labelClassName = "block text-sm font-medium text-zinc-700";

function AvistamientoSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando pista..." : "Publicar pista"}
    </button>
  );
}

function AvistamientoItem({ avistamiento }: { avistamiento: Avistamiento }) {
  const displayName =
    avistamiento.nombre_usuario?.trim() || "Anónimo";

  return (
    <article className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-semibold text-zinc-900">{displayName}</p>
        <RelativePublishedTime date={avistamiento.creado_el} />
      </div>
      {avistamiento.zona_avistamiento ? (
        <p className="mt-1 text-xs font-medium text-zinc-600">
          <span aria-hidden>📍</span> {avistamiento.zona_avistamiento}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
        {avistamiento.comentario}
      </p>
    </article>
  );
}

export function MascotaAvistamientosSection({
  mascotaId,
  initialAvistamientos,
}: {
  mascotaId: string;
  initialAvistamientos: Avistamiento[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [avistamientos, setAvistamientos] =
    useState<Avistamiento[]>(initialAvistamientos);
  const [showAll, setShowAll] = useState(false);
  const [comentarioLength, setComentarioLength] = useState(0);

  const [state, formAction] = useActionState<
    AvistamientoActionState,
    FormData
  >(publicarAvistamiento, initialAvistamientoActionState);

  useEffect(() => {
    if (!state.avistamiento) return;

    setAvistamientos((current) => {
      if (current.some((item) => item.id === state.avistamiento!.id)) {
        return current;
      }
      return [state.avistamiento!, ...current];
    });
    setShowAll(false);
    formRef.current?.reset();
    setComentarioLength(0);
  }, [state.avistamiento]);

  const visibleAvistamientos = useMemo(() => {
    if (showAll) return avistamientos;
    return avistamientos.slice(0, PREVIEW_COUNT);
  }, [avistamientos, showAll]);

  const hiddenCount = Math.max(0, avistamientos.length - PREVIEW_COUNT);

  return (
    <section className="border-t border-zinc-100 pt-5">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-zinc-900 sm:text-base">
          ¿Lo has visto? / Pistas de la comunidad
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">
          Comparte una pista breve si viste a esta mascota. Sin enlaces ni
          publicidad.
        </p>
      </div>

      {avistamientos.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {visibleAvistamientos.map((avistamiento) => (
            <AvistamientoItem
              key={avistamiento.id}
              avistamiento={avistamiento}
            />
          ))}

          {!showAll && hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Ver todas las pistas ({avistamientos.length})
            </button>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-500">
          Aún no hay pistas de la comunidad para este reporte.
        </p>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="mt-5 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <input type="hidden" name="mascota_id" value={mascotaId} />

        <div>
          <label htmlFor="nombre_usuario" className={labelClassName}>
            Nombre <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="nombre_usuario"
            name="nombre_usuario"
            type="text"
            maxLength={80}
            placeholder="Tu nombre o Anónimo"
            className={inputClassName}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="zona_avistamiento" className={labelClassName}>
            Zona del avistamiento{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="zona_avistamiento"
            name="zona_avistamiento"
            type="text"
            maxLength={120}
            placeholder="Ej. Los Palos Grandes, cerca del CCCT"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="comentario" className={labelClassName}>
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comentario"
            name="comentario"
            required
            rows={3}
            maxLength={AVISTAMIENTO_COMENTARIO_MAX_LENGTH}
            placeholder="Describe brevemente dónde y cuándo lo viste..."
            className={inputClassName}
            onChange={(event) =>
              setComentarioLength(event.target.value.length)
            }
          />
          <p className="mt-1 text-right text-xs text-zinc-500">
            {comentarioLength}/{AVISTAMIENTO_COMENTARIO_MAX_LENGTH}
          </p>
        </div>

        {state.error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            role="status"
          >
            {state.success}
          </p>
        ) : null}

        <AvistamientoSubmitButton />
      </form>
    </section>
  );
}
