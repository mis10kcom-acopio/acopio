import type { EstadoMascota, MascotaReportada, TipoReporte } from "@/types/database";

export const MASCOTA_ESTADOS: EstadoMascota[] = [
  "PERDIDO",
  "EN_RESGUARDO",
  "EN_CASA",
  "ADOPCION",
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
  ADOPCION: {
    label: "Adopción",
    badgeClass: "bg-blue-500",
    canvasColor: "#3B82F6",
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

  if (estado === "ADOPCION" || tipoReporte === "ADOPCION") {
    return "ADOPCION";
  }

  if (estado === "RESUELTO") {
    return "EN_CASA";
  }

  if (estado === "ACTIVO") {
    if (tipoReporte === "ADOPCION") {
      return "ADOPCION";
    }
    return tipoReporte === "ENCONTRADO" ? "EN_RESGUARDO" : "PERDIDO";
  }

  return "PERDIDO";
}

export function getMascotaEstado(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
): EstadoMascota {
  return normalizeEstadoMascota(mascota.estado, mascota.tipo_reporte);
}

/** Mapeo visual: ADOPCION se muestra como EN_RESGUARDO sin alterar la BD. */
export function getMascotaEstadoForDisplay(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
): EstadoMascota {
  const estado = getMascotaEstado(mascota);
  return estado === "ADOPCION" ? "EN_RESGUARDO" : estado;
}

export function getMascotaEstadoFormDisplay(estado: EstadoMascota): EstadoMascota {
  return estado === "ADOPCION" ? "EN_RESGUARDO" : estado;
}

export function resolveMascotaEstadoOnUpdate(
  currentEstado: EstadoMascota,
  selectedEstado: EstadoMascota,
): EstadoMascota {
  if (currentEstado === "ADOPCION" && selectedEstado === "EN_RESGUARDO") {
    return "ADOPCION";
  }
  return selectedEstado;
}

export function matchesMascotaEstadoFilter(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
  filter: "PERDIDO" | "EN_RESGUARDO",
): boolean {
  const estado = getMascotaEstado(mascota);
  if (filter === "EN_RESGUARDO") {
    return estado === "EN_RESGUARDO" || estado === "ADOPCION";
  }
  return estado === filter;
}

export function getMascotaEstadoConfig(
  mascota: Pick<MascotaReportada, "estado" | "tipo_reporte">,
) {
  return MASCOTA_ESTADO_CONFIG[getMascotaEstadoForDisplay(mascota)];
}

export function isMascotaEstadoActivo(estado: EstadoMascota): boolean {
  return (
    estado === "PERDIDO" || estado === "EN_RESGUARDO" || estado === "ADOPCION"
  );
}

export function confirmCambioEstadoMascota(estado: EstadoMascota): boolean {
  const label = MASCOTA_ESTADO_CONFIG[estado].label;
  return window.confirm(`¿Estás seguro de cambiar el estado a ${label}?`);
}
