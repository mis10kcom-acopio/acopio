import type { MascotaReportada, TipoReporte } from "@/types/database";

const SHARE_TITLE = "Huellas a Salvo";
const SHARE_TEXT = "Mira este reporte en Huellas a Salvo...";
const MASCOTA_SHARE_FILENAME = "mascota-huellas.jpg";
const POSTER_EXTRA_HEIGHT = 500;
const FOOTER_COLOR = "#D97706";

export type MascotaPosterInput = Pick<
  MascotaReportada,
  | "foto_url"
  | "tipo_reporte"
  | "nombre_mascota"
  | "especie"
  | "ubicacion_zona"
  | "caracteristicas"
  | "contacto_telefono"
>;

function loadCrossOriginImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = url;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo exportar la imagen")),
      "image/jpeg",
      0.92,
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxBottom?: number,
): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const fitsWidth = ctx.measureText(testLine).width <= maxWidth;

    if (!fitsWidth && line) {
      if (maxBottom !== undefined && currentY + lineHeight > maxBottom) {
        break;
      }
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && (maxBottom === undefined || currentY + lineHeight <= maxBottom)) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function drawStatusBanner(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  tipoReporte: TipoReporte,
): void {
  const esPerdido = tipoReporte === "PERDIDO";
  const label = esPerdido ? "PERDIDO" : "ENCONTRADO";
  const color = esPerdido ? "#EF4444" : "#22C55E";

  const fontSize = Math.max(18, Math.round(canvasWidth * 0.06));
  const paddingX = fontSize * 0.6;
  const paddingY = fontSize * 0.35;
  const margin = Math.round(canvasWidth * 0.03);

  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  const textWidth = ctx.measureText(label).width;
  const bannerWidth = textWidth + paddingX * 2;
  const bannerHeight = fontSize + paddingY * 2;

  ctx.fillStyle = color;
  ctx.fillRect(margin, margin, bannerWidth, bannerHeight);

  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(label, margin + paddingX, margin + bannerHeight / 2);
}

const INSTAGRAM_SAVE_HINT =
  "Mantén presionada la imagen para guardarla y compartirla.";

export type ComposeMascotaShareImageOptions = {
  forInstagram?: boolean;
};

export async function composeMascotaShareImage(
  data: MascotaPosterInput,
  options: ComposeMascotaShareImageOptions = {},
): Promise<Blob> {
  if (!data.foto_url) {
    throw new Error("La mascota no tiene foto");
  }

  const { forInstagram = false } = options;
  const img = await loadCrossOriginImage(data.foto_url);
  const width = img.naturalWidth;
  const imageHeight = img.naturalHeight;
  const footerHeight = Math.max(56, Math.round(width * 0.1));
  const instagramHintHeight = forInstagram
    ? Math.max(52, Math.round(width * 0.09))
    : 0;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = imageHeight + POSTER_EXTRA_HEIGHT + instagramHintHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas no disponible");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, width, imageHeight);
  drawStatusBanner(ctx, width, data.tipo_reporte);

  const paddingX = Math.round(width * 0.05);
  const contentWidth = width - paddingX * 2;
  const footerY = canvas.height - footerHeight;

  const contactSize = Math.max(18, Math.round(width * 0.055));
  const contactY = footerY - Math.round(width * 0.05) - contactSize;
  const maxDescBottom = contactY - Math.round(width * 0.04);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = imageHeight + Math.round(width * 0.04);

  const nameSize = Math.max(22, Math.round(width * 0.075));
  ctx.font = `bold ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#000000";
  const displayName = data.nombre_mascota?.trim() || data.especie;
  ctx.fillText(displayName, paddingX, y);
  y += nameSize * 1.4;

  const metaSize = Math.max(16, Math.round(width * 0.042));
  ctx.font = `${metaSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#52525B";
  ctx.fillText(
    `${data.especie} · Zona: ${data.ubicacion_zona}`,
    paddingX,
    y,
  );
  y += metaSize * 1.6;

  const descSize = Math.max(15, Math.round(width * 0.038));
  const descLineHeight = descSize * 1.45;
  ctx.font = `${descSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#3F3F46";
  y = wrapText(
    ctx,
    data.caracteristicas,
    paddingX,
    y,
    contentWidth,
    descLineHeight,
    maxDescBottom,
  );

  ctx.font = `bold ${contactSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.fillText(`CONTACTO: ${data.contacto_telefono}`, paddingX, contactY);

  ctx.fillStyle = FOOTER_COLOR;
  ctx.fillRect(0, footerY, width, footerHeight);

  const footerFontSize = Math.max(14, Math.round(width * 0.032));
  ctx.font = `600 ${footerFontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Generado en huellasasalvo.org",
    width / 2,
    footerY + footerHeight / 2,
  );

  if (forInstagram) {
    const hintY = footerY + footerHeight;
    ctx.fillStyle = "#18181B";
    ctx.fillRect(0, hintY, width, instagramHintHeight);

    const hintFontSize = Math.max(13, Math.round(width * 0.03));
    ctx.font = `bold ${hintFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      INSTAGRAM_SAVE_HINT,
      width / 2,
      hintY + instagramHintHeight / 2,
    );
  }

  return canvasToJpegBlob(canvas);
}

export function openBlobImagePage(blob: Blob): void {
  const imageUrl = URL.createObjectURL(blob);
  window.location.href = imageUrl;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareNativeText(url: string): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share no disponible");
  }

  await navigator.share({
    title: SHARE_TITLE,
    text: SHARE_TEXT,
    url,
  });
}

export async function shareNativeImage(blob: Blob, filename: string): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share no disponible");
  }

  const file = new File([blob], filename, {
    type: blob.type || "image/jpeg",
  });
  const shareData: ShareData = {
    files: [file],
    title: SHARE_TITLE,
    text: SHARE_TEXT,
  };

  if (!navigator.canShare?.(shareData)) {
    throw new Error("Compartir archivos no disponible");
  }

  await navigator.share(shareData);
}

export async function shareMascotaPhotoWithFallbacks(
  mascota: MascotaPosterInput,
  siteUrl: string,
): Promise<"shared-image" | "shared-text" | "downloaded" | "cancelled"> {
  let blob: Blob | null = null;

  if (mascota.foto_url) {
    try {
      blob = await composeMascotaShareImage(mascota);
    } catch {
      blob = null;
    }
  }

  if (blob) {
    try {
      await shareNativeImage(blob, MASCOTA_SHARE_FILENAME);
      return "shared-image";
    } catch {
      try {
        await shareNativeText(siteUrl);
        return "shared-text";
      } catch {
        downloadBlob(blob, MASCOTA_SHARE_FILENAME);
        return "downloaded";
      }
    }
  }

  try {
    await shareNativeText(siteUrl);
    return "shared-text";
  } catch {
    return "cancelled";
  }
}
