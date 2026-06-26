import type { TipoReporte } from "@/types/database";

const SHARE_TITLE = "Huellas a Salvo";
const SHARE_TEXT = "Mira este reporte en Huellas a Salvo...";
const MASCOTA_SHARE_FILENAME = "mascota-huellas.jpg";

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

export async function composeMascotaShareImage(
  fotoUrl: string,
  tipoReporte: TipoReporte,
): Promise<Blob> {
  const img = await loadCrossOriginImage(fotoUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas no disponible");
  }

  ctx.drawImage(img, 0, 0);

  const esPerdido = tipoReporte === "PERDIDO";
  const label = esPerdido ? "PERDIDO" : "ENCONTRADO";
  const color = esPerdido ? "#EF4444" : "#22C55E";

  const fontSize = Math.max(18, Math.round(canvas.width * 0.06));
  const paddingX = fontSize * 0.6;
  const paddingY = fontSize * 0.35;
  const margin = Math.round(canvas.width * 0.03);

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

  return canvasToJpegBlob(canvas);
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
  fotoUrl: string | null,
  tipoReporte: TipoReporte,
  siteUrl: string,
): Promise<"shared-image" | "shared-text" | "downloaded" | "cancelled"> {
  let blob: Blob | null = null;

  if (fotoUrl) {
    try {
      blob = await composeMascotaShareImage(fotoUrl, tipoReporte);
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
