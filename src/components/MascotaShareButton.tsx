"use client";

import { useState } from "react";
import { MascotaCartelButton } from "@/components/MascotaCartelModal";
import { buildMascotaPublicUrl } from "@/lib/mascota-url";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MascotaReportada } from "@/types/database";

const CARD_ACTION_BTN =
  "inline-flex min-h-[2.5rem] w-full min-w-0 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight shadow-sm transition sm:min-h-[2.75rem] sm:px-3 sm:text-sm";

const CARD_CALL_BTN =
  "inline-flex min-h-[2.5rem] w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight shadow-sm transition sm:min-h-[2.75rem] sm:gap-1.5 sm:px-3 sm:text-sm";

const DETAIL_ACTION_BTN =
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl px-4 py-2.5 text-base font-bold shadow-sm transition";

export function MascotaShareButton({
  mascotaId,
  className = "",
  fullWidth = false,
  layout = "card",
}: {
  mascotaId: string;
  className?: string;
  fullWidth?: boolean;
  layout?: "card" | "detail";
}) {
  const isDetail = layout === "detail";
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
      setLabel(isDetail ? "¡Enlace copiado!" : "¡Copiado!");
      setTimeout(() => setLabel("Compartir"), 2500);
    } catch {
      setLabel("Error");
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
      className={`${isDetail ? DETAIL_ACTION_BTN : CARD_ACTION_BTN} bg-sky-600 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <span className="truncate">{label}</span>
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
  const actionBtn = isDetail ? DETAIL_ACTION_BTN : CARD_ACTION_BTN;

  return (
    <div className={isDetail ? "space-y-3" : "space-y-3 border-t-2 border-zinc-100 pt-4"}>
      <div
        className={`grid gap-2 [&>*]:min-w-0 ${
          mascota.contacto_whatsapp ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {mascota.contacto_whatsapp ? (
          <a
            href={buildWhatsAppUrl(mascota.contacto_whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className={`${actionBtn} bg-[#25D366] text-white hover:bg-[#1da851]`}
          >
            WhatsApp
          </a>
        ) : null}
        <MascotaShareButton mascotaId={mascota.id} layout={layout} />
        <MascotaCartelButton mascota={mascota} layout={layout} />
      </div>

      <a
        href={buildTelUrl(mascota.contacto_telefono)}
        onClick={(event) => event.stopPropagation()}
        className={`${
          isDetail ? actionBtn : CARD_CALL_BTN
        } w-full border-2 border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 ${
          isDetail ? "gap-2" : ""
        }`}
      >
        <span className="shrink-0">📞 Llamar</span>
        <span className="min-w-0 truncate font-medium text-zinc-600 tabular-nums text-[16.5px] sm:text-sm">
          {mascota.contacto_telefono}
        </span>
      </a>
    </div>
  );
}
