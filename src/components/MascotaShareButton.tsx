"use client";

import { useState } from "react";
import { buildMascotaPublicUrl } from "@/lib/mascota-url";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MascotaReportada } from "@/types/database";

export function MascotaShareButton({
  mascotaId,
  className = "",
  fullWidth = false,
}: {
  mascotaId: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const [label, setLabel] = useState("Compartir");
  const [isCopying, setIsCopying] = useState(false);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isCopying) return;

    setIsCopying(true);

    try {
      const url = buildMascotaPublicUrl(mascotaId);
      await navigator.clipboard.writeText(url);
      setLabel("¡Enlace copiado!");
      setTimeout(() => setLabel("Compartir"), 2500);
    } catch {
      setLabel("No se pudo copiar");
      setTimeout(() => setLabel("Compartir"), 2500);
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isCopying}
      className={`inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {label}
    </button>
  );
}

export function MascotaContactActions({
  mascota,
  layout = "card",
}: {
  mascota: MascotaReportada;
  layout?: "card" | "detail";
}) {
  const isDetail = layout === "detail";

  return (
    <div className={isDetail ? "space-y-3" : "space-y-3 border-t-2 border-zinc-100 pt-4"}>
      <div className={`grid gap-2 ${mascota.contacto_whatsapp ? "grid-cols-2" : "grid-cols-1"}`}>
        {mascota.contacto_whatsapp ? (
          <a
            href={buildWhatsAppUrl(mascota.contacto_whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1da851] sm:text-base"
          >
            WhatsApp
          </a>
        ) : null}
        <MascotaShareButton
          mascotaId={mascota.id}
          fullWidth={!mascota.contacto_whatsapp}
        />
      </div>

      <a
        href={buildTelUrl(mascota.contacto_telefono)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold text-zinc-800 transition hover:bg-zinc-100 sm:text-base"
      >
        📞 Llamar — {mascota.contacto_telefono}
      </a>
    </div>
  );
}
