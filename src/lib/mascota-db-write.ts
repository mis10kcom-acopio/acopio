import type { SupabaseClient } from "@supabase/supabase-js";
import type { EstadoMascota, TipoReporte } from "@/types/database";

export const MASCOTAS_INSERT_COLUMNS = [
  "tipo_reporte",
  "estado",
  "nombre_mascota",
  "caracteristicas",
  "ubicacion_zona",
  "contacto_telefono",
  "contacto_whatsapp",
  "foto_url",
  "token_edicion",
] as const;

export type MascotaInsertPayload = {
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  foto_url: string | null;
  token_edicion: string;
};

type MascotasReportadasInsertRow = {
  tipo_reporte: TipoReporte;
  estado: string;
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  foto_url: string | null;
  token_edicion: string;
  contacto_whatsapp?: string;
};

type MascotaTokenUpdateResult = {
  data: { token_edicion: string } | null;
  error: { message: string } | null;
};

export function toModernDbEstado(estado: EstadoMascota): {
  estado: string;
  tipo_reporte: TipoReporte;
} {
  const tipoReporteMap: Record<EstadoMascota, TipoReporte> = {
    PERDIDO: "PERDIDO",
    EN_RESGUARDO: "EN_RESGUARDO",
    EN_CASA: "EN_CASA",
    ADOPCION: "ADOPCION",
  };
  return {
    estado,
    tipo_reporte: tipoReporteMap[estado],
  };
}

export function toLegacyDbEstado(estado: EstadoMascota): {
  estado: string;
  tipo_reporte: TipoReporte;
} {
  if (estado === "EN_CASA") {
    return { estado: "RESUELTO", tipo_reporte: "ENCONTRADO" };
  }

  if (estado === "PERDIDO") {
    return { estado: "ACTIVO", tipo_reporte: "PERDIDO" };
  }

  return { estado: "ACTIVO", tipo_reporte: "ENCONTRADO" };
}

export function isMascotaEstadoConstraintError(message: string): boolean {
  return (
    message.includes("mascotas_reportadas_estado_check") ||
    message.includes("mascotas_reportadas_tipo_reporte_check")
  );
}

function isMissingWhatsappColumnError(message: string): boolean {
  return message.includes("contacto_whatsapp");
}

function buildInsertRow(
  basePayload: MascotaInsertPayload,
  estadoRow: { estado: string; tipo_reporte: TipoReporte },
  includeWhatsapp: boolean,
): MascotasReportadasInsertRow {
  const row: MascotasReportadasInsertRow = {
    tipo_reporte: estadoRow.tipo_reporte,
    estado: estadoRow.estado,
    nombre_mascota: basePayload.nombre_mascota,
    caracteristicas: basePayload.caracteristicas,
    ubicacion_zona: basePayload.ubicacion_zona,
    contacto_telefono: basePayload.contacto_telefono,
    foto_url: basePayload.foto_url,
    token_edicion: basePayload.token_edicion,
  };

  if (includeWhatsapp && basePayload.contacto_whatsapp) {
    row.contacto_whatsapp = basePayload.contacto_whatsapp;
  }

  return row;
}

async function tryInsertRow(
  supabase: SupabaseClient,
  row: MascotasReportadasInsertRow,
) {
  return supabase.from("mascotas_reportadas").insert(row);
}

async function insertRowWithOptionalWhatsappFallback(
  supabase: SupabaseClient,
  basePayload: MascotaInsertPayload,
  estadoRow: { estado: string; tipo_reporte: TipoReporte },
): Promise<{ error: string | null }> {
  const withWhatsapp = buildInsertRow(basePayload, estadoRow, true);
  let { error } = await tryInsertRow(supabase, withWhatsapp);

  if (!error) return { error: null };

  if (isMissingWhatsappColumnError(error.message)) {
    const withoutWhatsapp = buildInsertRow(basePayload, estadoRow, false);
    ({ error } = await tryInsertRow(supabase, withoutWhatsapp));
    if (!error) return { error: null };
  }

  return { error: error.message };
}

export async function insertMascotaReportada(
  supabase: SupabaseClient,
  basePayload: MascotaInsertPayload,
  estadoLogico: EstadoMascota,
): Promise<{ error: string | null }> {
  const schemaAttempts = [
    toModernDbEstado(estadoLogico),
    toLegacyDbEstado(estadoLogico),
  ];

  let lastError: string | null = null;

  for (const estadoRow of schemaAttempts) {
    const result = await insertRowWithOptionalWhatsappFallback(
      supabase,
      basePayload,
      estadoRow,
    );

    if (!result.error) return { error: null };

    lastError = result.error;

    if (!isMascotaEstadoConstraintError(result.error)) {
      return { error: result.error };
    }
  }

  return { error: lastError ?? "No se pudo guardar el reporte." };
}

type MascotaUpdateFields = {
  nombre_mascota?: string | null;
  caracteristicas?: string;
  ubicacion_zona?: string;
  contacto_telefono?: string;
  contacto_whatsapp?: string | null;
};

function pickMascotaUpdateFields(
  fields: Record<string, unknown>,
): MascotaUpdateFields {
  const picked: MascotaUpdateFields = {};
  if ("nombre_mascota" in fields) picked.nombre_mascota = fields.nombre_mascota as string | null;
  if ("caracteristicas" in fields) picked.caracteristicas = fields.caracteristicas as string;
  if ("ubicacion_zona" in fields) picked.ubicacion_zona = fields.ubicacion_zona as string;
  if ("contacto_telefono" in fields) picked.contacto_telefono = fields.contacto_telefono as string;
  if ("contacto_whatsapp" in fields) picked.contacto_whatsapp = fields.contacto_whatsapp as string | null;
  return picked;
}

type MascotasReportadasUpdateRow = {
  tipo_reporte: TipoReporte;
  estado: string;
  nombre_mascota?: string | null;
  caracteristicas?: string;
  ubicacion_zona?: string;
  contacto_telefono?: string;
  contacto_whatsapp?: string | null;
  foto_url?: string | null;
};

function buildUpdateRow(
  fields: MascotaUpdateFields,
  estadoRow: { estado: string; tipo_reporte: TipoReporte },
  includeWhatsapp: boolean,
): MascotasReportadasUpdateRow {
  const row: MascotasReportadasUpdateRow = {
    tipo_reporte: estadoRow.tipo_reporte,
    estado: estadoRow.estado,
  };

  if (fields.nombre_mascota !== undefined) row.nombre_mascota = fields.nombre_mascota;
  if (fields.caracteristicas !== undefined) row.caracteristicas = fields.caracteristicas;
  if (fields.ubicacion_zona !== undefined) row.ubicacion_zona = fields.ubicacion_zona;
  if (fields.contacto_telefono !== undefined) row.contacto_telefono = fields.contacto_telefono;
  if (includeWhatsapp && fields.contacto_whatsapp !== undefined) row.contacto_whatsapp = fields.contacto_whatsapp;

  return row;
}

export async function updateMascotaReportada(
  supabase: SupabaseClient,
  id: string,
  fields: Record<string, unknown>,
  estadoLogico: EstadoMascota,
): Promise<MascotaTokenUpdateResult> {
  const safeFields = pickMascotaUpdateFields(fields);
  const schemaAttempts = [
    toModernDbEstado(estadoLogico),
    toLegacyDbEstado(estadoLogico),
  ];

  let lastResult: MascotaTokenUpdateResult | null = null;

  for (const estadoRow of schemaAttempts) {
    for (const includeWhatsapp of [true, false]) {
      const row = buildUpdateRow(safeFields, estadoRow, includeWhatsapp);
      const result = await supabase
        .from("mascotas_reportadas")
        .update(row)
        .eq("id", id)
        .select("token_edicion")
        .maybeSingle();

      if (!result.error) return result;

      lastResult = result;

      if (isMissingWhatsappColumnError(result.error.message) && includeWhatsapp) continue;
      if (!isMascotaEstadoConstraintError(result.error.message)) return result;

      break;
    }
  }

  return lastResult ?? { data: null, error: { message: "No se pudo actualizar el reporte." } };
}

export async function updateMascotaEstadoOnly(
  supabase: SupabaseClient,
  id: string,
  estadoLogico: EstadoMascota,
): Promise<MascotaTokenUpdateResult> {
  return updateMascotaReportada(supabase, id, {}, estadoLogico);
}