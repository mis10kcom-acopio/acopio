import type { EstadoMascota, MascotaReportada } from "@/types/database";
import {
  getMascotaEstado,
  MASCOTA_ESTADO_CONFIG,
} from "@/lib/mascota-estado";
import { getMascotaPrimaryFotoUrl } from "@/lib/mascota-fotos";

const SHARE_TITLE = "Huellas a Salvo";
const SHARE_TEXT = "Mira este reporte en Huellas a Salvo...";
const MASCOTA_SHARE_FILENAME = "mascota-huellas.jpg";
const POSTER_EXTRA_HEIGHT = 500;
const FOOTER_COLOR = "#D97706";

export type MascotaPosterInput = Pick<
  MascotaReportada,
  | "foto_url"
  | "foto_url_2"
  | "foto_url_3"
  | "estado"
  | "tipo_reporte"
  | "nombre_mascota"
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
  estado: EstadoMascota,
): void {
  const config = MASCOTA_ESTADO_CONFIG[estado];
  const label = config.label.toUpperCase();
  const color = config.canvasColor;

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
  "Haz una captura de pantalla (screenshot) de este cartel y compártela en tus historias o chats para ayudar.";

function measureWrappedLineCount(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;

  let line = "";
  let lineCount = 1;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      line = word;
      lineCount += 1;
    } else {
      line = testLine;
    }
  }

  return lineCount;
}

function drawCenteredWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let line = "";
  let currentY = startY;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, centerX - ctx.measureText(line).width / 2, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, centerX - ctx.measureText(line).width / 2, currentY);
  }
}

export type ComposeMascotaShareImageOptions = {
  forInstagram?: boolean;
};

const STORY_POSTER_WIDTH = 1080;
const STORY_POSTER_HEIGHT = 1920;
const STORY_PHOTO_HEIGHT = 1080;
const STORY_FOOTER_HEIGHT = 220;
const STORY_CARTEL_FILENAME = "cartel-huellas-a-salvo.jpg";

export const STORY_POSTER_ASPECT = STORY_POSTER_WIDTH / STORY_POSTER_HEIGHT;

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
): void {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = dWidth / dHeight;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dWidth, dHeight);
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#D97706";
  ctx.font = "bold 120px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🐾", width / 2, height / 2);
}

function truncateTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = testLine;
    }
  }

  if (lines.length < maxLines && line) {
    lines.push(line);
  } else if (lines.length >= maxLines && lines[maxLines - 1]) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}…`;
  }

  return lines.join("\n");
}

/** Cartel vertical 9:16 para historias de Instagram y redes sociales. */
export async function composeMascotaStoryPoster(
  data: MascotaPosterInput,
): Promise<Blob> {
  const width = STORY_POSTER_WIDTH;
  const height = STORY_POSTER_HEIGHT;
  const photoHeight = STORY_PHOTO_HEIGHT;
  const footerHeight = STORY_FOOTER_HEIGHT;
  const infoTop = photoHeight;
  const infoHeight = height - photoHeight - footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas no disponible");
  }

  ctx.fillStyle = "#FFFBEB";
  ctx.fillRect(0, 0, width, height);

  const fotoPrincipal = getMascotaPrimaryFotoUrl(data);

  if (fotoPrincipal) {
    try {
      const img = await loadCrossOriginImage(fotoPrincipal);
      drawCoverImage(ctx, img, 0, 0, width, photoHeight);
    } catch {
      drawPhotoPlaceholder(ctx, width, photoHeight);
    }
  } else {
    drawPhotoPlaceholder(ctx, width, photoHeight);
  }

  const estado = getMascotaEstado(data);
  drawStatusBanner(ctx, width, estado);

  ctx.fillStyle = "#FFFBEB";
  ctx.fillRect(0, infoTop, width, infoHeight);

  const paddingX = 72;
  const contentWidth = width - paddingX * 2;
  let y = infoTop + 56;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const nameSize = 56;
  ctx.font = `bold ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  const displayName = data.nombre_mascota?.trim() || "Mascota reportada";
  y = wrapText(ctx, displayName, paddingX, y, contentWidth, nameSize * 1.15) + 12;

  const estadoConfig = MASCOTA_ESTADO_CONFIG[estado];
  const badgeFontSize = 34;
  ctx.font = `bold ${badgeFontSize}px system-ui, -apple-system, sans-serif`;
  const badgeLabel = estadoConfig.label.toUpperCase();
  const badgePaddingX = 24;
  const badgePaddingY = 12;
  const badgeTextWidth = ctx.measureText(badgeLabel).width;
  const badgeWidth = badgeTextWidth + badgePaddingX * 2;
  const badgeHeight = badgeFontSize + badgePaddingY * 2;

  ctx.fillStyle = estadoConfig.canvasColor;
  ctx.fillRect(paddingX, y, badgeWidth, badgeHeight);

  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeLabel, paddingX + badgePaddingX, y + badgeHeight / 2);
  ctx.textBaseline = "top";
  y += badgeHeight + 28;

  const metaSize = 38;
  ctx.font = `600 ${metaSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#3F3F46";
  ctx.fillText(`📍 ${data.ubicacion_zona}`, paddingX, y);
  y += metaSize * 1.55;

  ctx.fillText(`📞 ${data.contacto_telefono}`, paddingX, y);
  y += metaSize * 1.55;

  const descSize = 34;
  const descLineHeight = descSize * 1.45;
  ctx.font = `${descSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#52525B";

  const footerTop = height - footerHeight;
  const maxDescBottom = footerTop - 24;
  const maxDescLines = Math.max(
    2,
    Math.floor((maxDescBottom - y) / descLineHeight),
  );
  const truncatedDesc = truncateTextToLines(
    ctx,
    data.caracteristicas,
    contentWidth,
    maxDescLines,
  );

  for (const line of truncatedDesc.split("\n")) {
    if (y + descLineHeight > maxDescBottom) break;
    ctx.fillText(line, paddingX, y);
    y += descLineHeight;
  }

  const footerY = height - footerHeight;
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(0, footerY, width, footerHeight);

  ctx.strokeStyle = "#FDE68A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  try {
    const logoUrl = `${window.location.origin}/logohuellas.png`;
    const logo = await loadCrossOriginImage(logoUrl);
    const logoSize = 88;
    const logoX = width / 2 - logoSize / 2;
    const logoY = footerY + 28;
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch {
    ctx.font = "bold 40px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#D97706";
    ctx.textAlign = "center";
    ctx.fillText("Huellas a Salvo", width / 2, footerY + 52);
  }

  ctx.font = "600 32px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#92400E";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("huellasasalvo.org", width / 2, footerY + 132);

  return canvasToJpegBlob(canvas);
}

export function downloadMascotaStoryPoster(blob: Blob): void {
  downloadBlob(blob, STORY_CARTEL_FILENAME);
}

export { STORY_CARTEL_FILENAME };

export async function composeMascotaShareImage(
  data: MascotaPosterInput,
  options: ComposeMascotaShareImageOptions = {},
): Promise<Blob> {
  const fotoPrincipal = getMascotaPrimaryFotoUrl(data);
  if (!fotoPrincipal) {
    throw new Error("La mascota no tiene foto");
  }

  const { forInstagram = false } = options;
  const img = await loadCrossOriginImage(fotoPrincipal);
  const width = img.naturalWidth;
  const imageHeight = img.naturalHeight;
  const footerHeight = Math.max(56, Math.round(width * 0.1));

  const hintFontSize = Math.max(12, Math.round(width * 0.028));
  const hintLineHeight = hintFontSize * 1.4;
  const hintPaddingX = Math.round(width * 0.06);
  const hintMaxWidth = width - hintPaddingX * 2;

  let instagramHintHeight = 0;
  if (forInstagram) {
    const measureCtx = document.createElement("canvas").getContext("2d");
    if (measureCtx) {
      measureCtx.font = `bold ${hintFontSize}px system-ui, -apple-system, sans-serif`;
      const lineCount = measureWrappedLineCount(
        measureCtx,
        INSTAGRAM_SAVE_HINT,
        hintMaxWidth,
      );
      instagramHintHeight = Math.max(
        64,
        Math.round(hintLineHeight * lineCount + hintFontSize * 1.2),
      );
    } else {
      instagramHintHeight = Math.max(72, Math.round(width * 0.12));
    }
  }

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
  drawStatusBanner(ctx, width, getMascotaEstado(data));

  const paddingX = Math.round(width * 0.05);
  const contentWidth = width - paddingX * 2;
  const footerY = canvas.height - footerHeight - instagramHintHeight;

  const contactSize = Math.max(18, Math.round(width * 0.055));
  const contactY = footerY - Math.round(width * 0.05) - contactSize;
  const maxDescBottom = contactY - Math.round(width * 0.04);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = imageHeight + Math.round(width * 0.04);

  const nameSize = Math.max(22, Math.round(width * 0.075));
  ctx.font = `bold ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#000000";
  const displayName = data.nombre_mascota?.trim() || "Mascota reportada";
  ctx.fillText(displayName, paddingX, y);
  y += nameSize * 1.4;

  const metaSize = Math.max(16, Math.round(width * 0.042));
  ctx.font = `${metaSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#52525B";
  ctx.fillText(`Zona: ${data.ubicacion_zona}`, paddingX, y);
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

    ctx.font = `bold ${hintFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    drawCenteredWrappedText(
      ctx,
      INSTAGRAM_SAVE_HINT,
      width / 2,
      hintY + Math.round(hintFontSize * 0.6),
      hintMaxWidth,
      hintLineHeight,
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

  const fotoPrincipal = getMascotaPrimaryFotoUrl(mascota);

  if (fotoPrincipal) {
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
