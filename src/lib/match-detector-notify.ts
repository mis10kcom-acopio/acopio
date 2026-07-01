/** Dispara el detector de matches sin bloquear el guardado del reporte. */
export function notifyMatchDetectorAsync(recordId: string): void {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl || !recordId) return;

  void (async () => {
    try {
      await fetch(`${baseUrl}/api/match-detector`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ record: { id: recordId } }),
      });
    } catch (error) {
      console.error("[match-detector-notify] Error en segundo plano:", error);
    }
  })();
}
