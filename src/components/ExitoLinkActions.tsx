"use client";

import { useState } from "react";
import { buildWhatsAppSelfSaveUrl } from "@/lib/whatsapp";

interface ExitoLinkActionsProps {
  editUrl: string;
  telefono: string | null;
}

export function ExitoLinkActions({ editUrl, telefono }: ExitoLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const whatsappUrl =
    telefono && telefono.trim()
      ? buildWhatsAppSelfSaveUrl(telefono, editUrl)
      : null;

  return (
    <>
      <div
        className="mt-6 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-4 text-left"
        role="alert"
      >
        <p className="text-base font-bold leading-snug text-amber-950">
          ⚠️ ¡IMPORTANTE! Copia y guarda este enlace seguro. Es la única forma de
          editar o eliminar tu publicación más adelante.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          Tu enlace de edición
        </p>
        <a
          href={editUrl}
          className="mt-2 block break-all text-sm font-medium text-amber-900 underline decoration-amber-400 underline-offset-2"
        >
          {editUrl}
        </a>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[3rem] rounded-xl border-2 border-amber-400 bg-amber-100 px-4 py-3 text-base font-bold text-amber-950 transition hover:bg-amber-200"
          >
            {copied ? "¡Copiado!" : "📋 Copiar mi enlace"}
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-center text-base font-bold text-white shadow-sm transition hover:bg-[#1da851]"
            >
              📲 Enviarlo a mi WhatsApp
            </a>
          ) : (
            <p className="flex min-h-[3rem] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-sm text-zinc-500">
              Añade un teléfono al registrarte para enviarte el enlace por
              WhatsApp.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
