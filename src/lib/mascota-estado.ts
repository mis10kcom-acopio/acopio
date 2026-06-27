import type { EstadoMascota, MascotaReportada, TipoReporte } from "@/types/database";

export const MASCOTA_ESTADOS: EstadoMascota[] = [
  "PERDIDO",
  "EN_RESGUARDO",
  "EN_CASA",
];

export const MASCOTA_ESTADO_CONFIG: Record<
  EstadoMascota,
  { label: string; badgeClass: string; canvasColor: string }
> = {
  PERDIDO: {
    label: "Perdido",
    badgeClass: "bg-red-500",
    canvasColor: "#EF4444",
  },
  EN_RESGUARDO: {
    label: "En Resguardo",
    badgeClass: "bg-yellow-500",
    canvasColor: "#EAB308",
  },
  EN_CASA: {
    label: "En Casa",
    badgeClass: "bg-green-500",
    canvasColor: "#22C55E",
  },
};

export function parseEstadoMascota(value: string): EstadoMascota {
  if (MASCOTA_ESTADOS.includes(value as EstadoMascota)) {
    return value as EstadoMascota;
  }
  throw new Error("Selecciona un estado válido para la mascota.");
}

export function normalizeEstadoMascota(
  estado: string,
  tipoReporte?: TipoReporte | string,
): EstadoMascota {
  if (MASCOTA_ESTADOS.includes(estado as EstadoMascota)) {
    return estado as EstadoMascota;
  }

  if (estado === "RESUELTO") {
    return "EN_CASA";
  }

  if (estado === "ACTIVO") {
    return tipoReporte === "ENCONTRADO" ? "EN_RESGUARDO" : "PERDIDO";
  }

  return "PERDIDO";
}

export function getMascotaEstado(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
): EstadoMascota {
  return normalizeEstadoMascota(mascota.estado, mascota.tipo_reporte);
}

export function getMascotaEstadoConfig(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
) {
  return MASCOTA_ESTADO_CONFIG[getMascotaEstado(mascota)];
}
