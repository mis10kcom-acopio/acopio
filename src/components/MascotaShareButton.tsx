"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { MascotaCartelButton } from "@/components/MascotaCartelModal";
import { buildMascotaPublicUrl } from "@/lib/mascota-url";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { MascotaReportada } from "@/types/database";

const CARD_ACTION_BTN =
  "inline-flex min-h-[2.5rem] w-full min-w-0 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight shadow-sm transition sm:min-h-[2.75rem] sm:px-3 sm:text-sm";

const CARD_PHONE_DISPLAY =
  "flex min-h-[2.5rem] w-full min-w-0 items-center justify-center rounded-lg border-2 border-zinc-200 bg-zinc-50 px-2 py-2 text-center sm:min-h-[2.75rem] sm:px-3";

const DETAIL_ACTION_BTN =
  "inline-flex min-h-[3rem] items-center justify-center rounded-xl px-4 py-2.5 text-base font-bold shadow-sm transition";

async function shareMascotaLink(mascotaId: string): Promise<"shared" | "copied"> {
  const url = buildMascotaPublicUrl(mascotaId);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        url,
        title: "Huellas a Salvo",
        text: "Reporte de mascota en Huellas a Salvo",
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}

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
  const [isSharing, setIsSharing] = useState(false);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isSharing) return;

    setIsSharing(true);

    try {
      const result = await shareMascotaLink(mascotaId);
      setLabel(
        result === "copied"
          ? isDetail
            ? "¡Enlace copiado!"
            : "¡Copiado!"
          : "Compartir",
      );
      if (result === "copied") {
        setTimeout(() => setLabel("Compartir"), 2500);
      }
    } catch {
      setLabel("Error");
      setTimeout(() => setLabel("Compartir"), 2500);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className={`${isDetail ? DETAIL_ACTION_BTN : CARD_ACTION_BTN} bg-sky-600 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

function MascotaShareTextLink({ mascotaId }: { mascotaId: string }) {
  const [label, setLabel] = useState("Compartir");
  const [isSharing, setIsSharing] = useState(false);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isSharing) return;

    setIsSharing(true);

    try {
      const result = await shareMascotaLink(mascotaId);
      if (result === "copied") {
        setLabel("¡Copiado!");
        setTimeout(() => setLabel("Compartir"), 2500);
      }
    } catch {
      setLabel("Error");
      setTimeout(() => setLabel("Compartir"), 2500);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className="mx-auto flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-700 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Share2 className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
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

  if (!isDetail) {
    return (
      <div className="space-y-3 border-t-2 border-zinc-100 pt-4">
        <div className="grid grid-cols-2 gap-2 [&>*]:min-w-0">
          {mascota.contacto_whatsapp ? (
            <a
              href={buildWhatsAppUrl(mascota.contacto_whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className={`${CARD_ACTION_BTN} bg-[#25D366] text-white hover:bg-[#1da851]`}
            >
              WhatsApp
            </a>
          ) : null}
          <MascotaCartelButton
            mascota={mascota}
            layout="card"
            className={mascota.contacto_whatsapp ? "" : "col-span-2"}
          />
        </div>

        {mascota.contacto_telefono ? (
          <div className={CARD_PHONE_DISPLAY}>
            <span className="font-medium tabular-nums text-[19.8px] text-zinc-800 sm:text-[16.8px]">
              {mascota.contacto_telefono}
            </span>
          </div>
        ) : null}

        <MascotaShareTextLink mascotaId={mascota.id} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
        className={`${actionBtn} w-full gap-2 border-2 border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100`}
      >
        <span className="shrink-0">📞 Llamar</span>
        <span className="min-w-0 truncate font-medium text-zinc-600 tabular-nums">
          {mascota.contacto_telefono}
        </span>
      </a>
    </div>
  );
}
