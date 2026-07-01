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

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawStatusBadgePill(
  ctx: CanvasRenderingContext2D,
  estado: EstadoMascota,
  x: number,
  y: number,
): void {
  const config = MASCOTA_ESTADO_CONFIG[estado];
  const label = config.label;
  const fontSize = 28;
  const paddingX = 20;
  const paddingY = 10;

  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  const textWidth = ctx.measureText(label).width;
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = fontSize + paddingY * 2;

  ctx.fillStyle = config.canvasColor;
  drawRoundedRectPath(ctx, x, y, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + paddingX, y + badgeHeight / 2);
  ctx.textBaseline = "top";
}

function drawStatusBanner(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  estado: EstadoMascota,
): void {
  const margin = Math.max(24, Math.round(canvasWidth * 0.04));
  drawStatusBadgePill(ctx, estado, margin, margin);
}

function drawSectionLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
): number {
  const fontSize = 20;
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#71717A";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
  return y + fontSize + 10;
}

function drawPhoneBox(
  ctx: CanvasRenderingContext2D,
  phone: string,
  canvasWidth: number,
  y: number,
  height: number,
  options: { fontSize?: number; fontWeight?: number } = {},
): void {
  const paddingX = 48;
  const boxWidth = canvasWidth - paddingX * 2;
  const radius = 16;
  const fontSize = options.fontSize ?? 34;
  const fontWeight = options.fontWeight ?? 500;

  ctx.fillStyle = "#FAFAFA";
  drawRoundedRectPath(ctx, paddingX, y, boxWidth, height, radius);
  ctx.fill();

  ctx.strokeStyle = "#D4D4D8";
  ctx.lineWidth = 3;
  drawRoundedRectPath(ctx, paddingX, y, boxWidth, height, radius);
  ctx.stroke();

  ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(phone.trim() || "—", canvasWidth / 2, y + height / 2);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
}

async function drawCartelFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  footerTop: number,
  footerHeight: number,
): Promise<void> {
  const logoSize = 72;
  const logoY = footerTop + 16;

  try {
    const logoUrl = `${window.location.origin}/logohuellas.png`;
    const logo = await loadCrossOriginImage(logoUrl);
    ctx.drawImage(logo, width / 2 - logoSize / 2, logoY, logoSize, logoSize);
  } catch {
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#D97706";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Huellas a Salvo", width / 2, logoY + 8);
  }

  ctx.font = "600 28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#D97706";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("huellasasalvo.org", width / 2, logoY + logoSize + 12);
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

const STORY_POSTER_WIDTH = 900;
const STORY_POSTER_HEIGHT = 1200;
const STORY_PHOTO_HEIGHT = Math.round(STORY_POSTER_HEIGHT / 3);
const STORY_FOOTER_HEIGHT = 150;
const STORY_CARTEL_BG = "#FFFBF2";
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

const CARTEL_HEADLINE: Record<EstadoMascota, string> = {
  PERDIDO: "SE BUSCA",
  EN_RESGUARDO: "EN RESGUARDO",
  EN_CASA: "EN CASA",
  ADOPCION: "BUSCA HOGAR",
};

const CARTEL_PHONE_LABEL: Record<EstadoMascota, string> = {
  PERDIDO: "Si lo viste, llama:",
  EN_RESGUARDO: "Si es tu mascota, llama:",
  EN_CASA: "Contacto:",
  ADOPCION: "¿Interesado? Llama:",
};

function wrapTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
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
    if (ctx.measureText(testLine).width > maxWidth && line) {
      if (maxBottom !== undefined && currentY + lineHeight > maxBottom) {
        break;
      }
      ctx.fillText(line, centerX - ctx.measureText(line).width / 2, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && (maxBottom === undefined || currentY + lineHeight <= maxBottom)) {
    ctx.fillText(line, centerX - ctx.measureText(line).width / 2, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function drawCartelHeaderBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  estado: EstadoMascota,
): number {
  const height = 76;
  const config = MASCOTA_ESTADO_CONFIG[estado];

  ctx.fillStyle = config.canvasColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.fillRect(0, height - 4, width, 4);

  ctx.font = "900 44px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(CARTEL_HEADLINE[estado], width / 2, height / 2 - 1);
  ctx.textBaseline = "top";

  return height;
}

async function drawFramedPhotoSection(
  ctx: CanvasRenderingContext2D,
  data: MascotaPosterInput,
  width: number,
  top: number,
  sectionHeight: number,
  estado: EstadoMascota,
): Promise<number> {
  const inset = 36;
  const x = inset;
  const y = top + 12;
  const frameWidth = width - inset * 2;
  const frameHeight = sectionHeight - 24;
  const radius = 22;

  ctx.save();
  ctx.fillStyle = "rgba(24,24,27,0.1)";
  drawRoundedRectPath(ctx, x + 5, y + 8, frameWidth, frameHeight, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, x, y, frameWidth, frameHeight, radius);
  ctx.clip();

  const fotoPrincipal = getMascotaPrimaryFotoUrl(data);
  if (fotoPrincipal) {
    try {
      const img = await loadCrossOriginImage(fotoPrincipal);
      drawCoverImage(ctx, img, x, y, frameWidth, frameHeight);
    } catch {
      ctx.fillStyle = "#FEF3C7";
      ctx.fillRect(x, y, frameWidth, frameHeight);
      ctx.font = "bold 96px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#D97706";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐾", x + frameWidth / 2, y + frameHeight / 2);
      ctx.textBaseline = "top";
    }
  } else {
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(x, y, frameWidth, frameHeight);
    ctx.font = "bold 96px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#D97706";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐾", x + frameWidth / 2, y + frameHeight / 2);
    ctx.textBaseline = "top";
  }

  ctx.restore();

  ctx.strokeStyle = "#D6D3D1";
  ctx.lineWidth = 4;
  drawRoundedRectPath(ctx, x, y, frameWidth, frameHeight, radius);
  ctx.stroke();

  drawStatusBadgePill(ctx, estado, x + 18, y + 18);

  return y + frameHeight;
}

function measureWrappedHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  maxLines?: number,
): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return lineHeight;

  let line = "";
  let lineCount = 1;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      line = word;
      lineCount += 1;
      if (maxLines !== undefined && lineCount >= maxLines) break;
    } else {
      line = testLine;
    }
  }

  return lineCount * lineHeight;
}

function drawZoneHighlightBox(
  ctx: CanvasRenderingContext2D,
  zone: string,
  width: number,
  paddingX: number,
  y: number,
  contentWidth: number,
): number {
  const innerPad = 22;
  const labelSize = 18;
  const zoneSize = 38;
  const zoneLineHeight = zoneSize * 1.25;
  const innerWidth = contentWidth - innerPad * 2;

  ctx.font = `bold ${zoneSize}px system-ui, -apple-system, sans-serif`;
  const zoneHeight = measureWrappedHeight(
    ctx,
    zone,
    innerWidth,
    zoneLineHeight,
    3,
  );
  const boxHeight = innerPad + labelSize + 14 + zoneHeight + innerPad;

  ctx.fillStyle = "#FEF3C7";
  drawRoundedRectPath(ctx, paddingX, y, contentWidth, boxHeight, 18);
  ctx.fill();

  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 3;
  drawRoundedRectPath(ctx, paddingX, y, contentWidth, boxHeight, 18);
  ctx.stroke();

  ctx.font = `bold ${labelSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#92400E";
  ctx.textAlign = "center";
  ctx.fillText("ZONA / MUNICIPIO", width / 2, y + innerPad);

  ctx.font = `bold ${zoneSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  wrapTextCentered(
    ctx,
    zone,
    width / 2,
    y + innerPad + labelSize + 14,
    innerWidth,
    zoneLineHeight,
    y + boxHeight - innerPad,
  );
  ctx.textAlign = "left";

  return y + boxHeight;
}

/** Cartel vertical 3:4 — diseño clásico (detalle móvil). */
export async function composeMascotaStoryPosterClassic(
  data: MascotaPosterInput,
): Promise<Blob> {
  const width = STORY_POSTER_WIDTH;
  const height = STORY_POSTER_HEIGHT;
  const photoHeight = STORY_PHOTO_HEIGHT;
  const footerHeight = STORY_FOOTER_HEIGHT;
  const paddingX = 48;
  const contentWidth = width - paddingX * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas no disponible");
  }

  ctx.fillStyle = STORY_CARTEL_BG;
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
  drawStatusBadgePill(ctx, estado, 32, 32);

  const footerTop = height - footerHeight;
  const phoneBoxHeight = 72;
  const phoneBoxGap = 28;
  const zoneGap = 28;
  const phoneBoxY = footerTop - phoneBoxGap - phoneBoxHeight;

  const zoneSize = 32;
  const zoneLineHeight = zoneSize * 1.35;
  const zoneLabelHeight = 30;
  const zoneSectionHeight = zoneLabelHeight + zoneLineHeight + 8;
  const zoneY = phoneBoxY - zoneGap - zoneSectionHeight;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = photoHeight + 40;

  const nameSize = 44;
  ctx.font = `bold ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  const displayName = data.nombre_mascota?.trim() || "Mascota reportada";
  y =
    wrapText(ctx, displayName, paddingX, y, contentWidth, nameSize * 1.15) + 28;

  y = drawSectionLabel(ctx, "CARACTERÍSTICAS", paddingX, y);

  const charSize = 28;
  const charLineHeight = charSize * 1.5;
  ctx.font = `${charSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#3F3F46";
  y = wrapText(
    ctx,
    data.caracteristicas,
    paddingX,
    y,
    contentWidth,
    charLineHeight,
    zoneY - 20,
  );
  y += 24;

  drawSectionLabel(ctx, "ZONA / MUNICIPIO", paddingX, zoneY);

  ctx.font = `600 ${zoneSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  wrapText(
    ctx,
    data.ubicacion_zona,
    paddingX,
    zoneY + zoneLabelHeight,
    contentWidth,
    zoneLineHeight,
    phoneBoxY - 12,
  );

  drawPhoneBox(ctx, data.contacto_telefono, width, phoneBoxY, phoneBoxHeight);
  await drawCartelFooter(ctx, width, footerTop, footerHeight);

  return canvasToJpegBlob(canvas);
}

/** Cartel vertical 3:4 — diseño búsqueda con jerarquía reforzada. */
export async function composeMascotaStoryPosterV2(
  data: MascotaPosterInput,
): Promise<Blob> {
  const width = STORY_POSTER_WIDTH;
  const height = STORY_POSTER_HEIGHT;
  const paddingX = 48;
  const contentWidth = width - paddingX * 2;
  const footerHeight = 130;
  const photoSectionHeight = 430;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas no disponible");
  }

  const estado = getMascotaEstado(data);
  const displayName = data.nombre_mascota?.trim() || "Mascota reportada";

  ctx.fillStyle = STORY_CARTEL_BG;
  ctx.fillRect(0, 0, width, height);

  const headerBottom = drawCartelHeaderBand(ctx, width, estado);
  const photoBottom = await drawFramedPhotoSection(
    ctx,
    data,
    width,
    headerBottom,
    photoSectionHeight,
    estado,
  );

  const footerTop = height - footerHeight;
  const phoneBoxHeight = 84;
  const phoneLabelSize = 22;
  const phoneBlockHeight = phoneLabelSize + 12 + phoneBoxHeight;
  const phoneBlockY = footerTop - 28 - phoneBlockHeight;

  let y = photoBottom + 28;

  const nameSize = 56;
  ctx.font = `900 ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#18181B";
  ctx.textAlign = "center";
  y =
    wrapTextCentered(
      ctx,
      displayName,
      width / 2,
      y,
      contentWidth,
      nameSize * 1.12,
    ) + 22;

  y = drawZoneHighlightBox(
    ctx,
    data.ubicacion_zona,
    width,
    paddingX,
    y,
    contentWidth,
  );
  y += 22;

  y = drawSectionLabel(ctx, "CARACTERÍSTICAS", paddingX, y);

  const charSize = 26;
  const charLineHeight = charSize * 1.45;
  ctx.font = `${charSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#52525B";
  wrapText(
    ctx,
    data.caracteristicas,
    paddingX,
    y,
    contentWidth,
    charLineHeight,
    phoneBlockY - 16,
  );

  ctx.font = `bold ${phoneLabelSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "#3F3F46";
  ctx.textAlign = "center";
  ctx.fillText(CARTEL_PHONE_LABEL[estado], width / 2, phoneBlockY);
  ctx.textAlign = "left";

  drawPhoneBox(ctx, data.contacto_telefono, width, phoneBlockY + phoneLabelSize + 12, phoneBoxHeight, {
    fontSize: 40,
    fontWeight: 700,
  });
  await drawCartelFooter(ctx, width, footerTop, footerHeight);

  return canvasToJpegBlob(canvas);
}

/** Cartel descargable activo (v2 búsqueda). */
export async function composeMascotaStoryPoster(
  data: MascotaPosterInput,
): Promise<Blob> {
  return composeMascotaStoryPosterV2(data);
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
