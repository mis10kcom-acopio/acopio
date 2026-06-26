const SHARE_TITLE = "Huellas a Salvo";
const SHARE_TEXT = "Mira este reporte en Huellas a Salvo...";

export async function captureElementAsPngBlob(
  element: HTMLElement,
): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("No se pudo generar la imagen de la tarjeta.");
  }

  return blob;
}

export async function shareNativeText(url: string): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share no disponible");
  }

  const shareData: ShareData = {
    title: SHARE_TITLE,
    text: SHARE_TEXT,
    url,
  };

  await navigator.share(shareData);
}

export async function shareNativeImage(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share no disponible");
  }

  const file = new File([blob], filename, { type: "image/png" });
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

export async function shareMascotaCardImageOrText(
  blob: Blob,
  filename: string,
  url: string,
): Promise<boolean> {
  try {
    await shareNativeImage(blob, filename);
    return true;
  } catch {
    try {
      await shareNativeText(url);
      return true;
    } catch {
      return false;
    }
  }
}
