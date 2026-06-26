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

export async function shareImage(
  blob: Blob,
  filename: string,
): Promise<boolean> {
  const file = new File([blob], filename, { type: "image/png" });
  const shareData: ShareData = {
    files: [file],
    title: "Huellas a Salvo",
    text: "Mira este reporte en Huellas a Salvo...",
  };

  if (!navigator.canShare?.(shareData)) {
    return false;
  }

  await navigator.share(shareData);
  return true;
}
