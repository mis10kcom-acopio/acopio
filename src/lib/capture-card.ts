export async function captureElementAsPngBlob(
  element: HTMLElement,
): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
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

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const shareData = {
    files: [file],
    title: "Mascota en Huellas a Salvo",
    text: "Ayúdanos a difundir. Más información en: https://huellasasalvo.org",
  };

  if (navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
    return "shared";
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
