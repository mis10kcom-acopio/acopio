import type { SupabaseClient } from "@supabase/supabase-js";
import type { EstadoMascota, TipoReporte } from "@/types/database";

type MascotaTokenUpdateResult = {
  data: { token_edicion: string } | null;
  error: { message: string } | null;
};

export function toModernDbEstado(estado: EstadoMascota): {
  estado: string;
  tipo_reporte: TipoReporte;
} {
  return {
    estado,
    tipo_reporte: estado === "PERDIDO" ? "PERDIDO" : "ENCONTRADO",
  };
}

/** Valores aceptados por la BD antes de la migración a 3 estados. */
export function toLegacyDbEstado(estado: EstadoMascota): {
  estado: string;
  tipo_reporte: TipoReporte;
} {
  if (estado === "EN_CASA") {
    return { estado: "RESUELTO", tipo_reporte: "ENCONTRADO" };
  }

  return {
    estado: "ACTIVO",
    tipo_reporte: estado === "PERDIDO" ? "PERDIDO" : "ENCONTRADO",
  };
}

export function isMascotaEstadoConstraintError(message: string): boolean {
  return message.includes("mascotas_reportadas_estado_check");
}

function isMissingWhatsappColumnError(message: string): boolean {
  return message.includes("contacto_whatsapp");
}

type MascotaInsertPayload = {
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  foto_url: string | null;
  token_edicion: string;
};

function buildInsertRow(
  basePayload: MascotaInsertPayload,
  estadoRow: { estado: string; tipo_reporte: TipoReporte },
  includeWhatsapp: boolean,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    nombre_mascota: basePayload.nombre_mascota,
    caracteristicas: basePayload.caracteristicas,
    ubicacion_zona: basePayload.ubicacion_zona,
    contacto_telefono: basePayload.contacto_telefono,
    foto_url: basePayload.foto_url,
    token_edicion: basePayload.token_edicion,
    ...estadoRow,
  };

  if (includeWhatsapp && basePayload.contacto_whatsapp) {
    row.contacto_whatsapp = basePayload.contacto_whatsapp;
  }

  return row;
}

async function tryInsertRow(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
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

  if (!error) {
    return { error: null };
  }

  if (isMissingWhatsappColumnError(error.message)) {
    const withoutWhatsapp = buildInsertRow(basePayload, estadoRow, false);
    ({ error } = await tryInsertRow(supabase, withoutWhatsapp));

    if (!error) {
      return { error: null };
    }
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

    if (!result.error) {
      return { error: null };
    }

    lastError = result.error;

    if (!isMascotaEstadoConstraintError(result.error)) {
      return { error: result.error };
    }
  }

  return {
    error: lastError ?? "No se pudo guardar el reporte.",
  };
}

function buildUpdateRow(
  fields: Record<string, unknown>,
  estadoRow: { estado: string; tipo_reporte: TipoReporte },
  includeWhatsapp: boolean,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    ...fields,
    ...estadoRow,
  };

  if (!includeWhatsapp) {
    delete row.contacto_whatsapp;
  }

  return row;
}

export async function updateMascotaReportada(
  supabase: SupabaseClient,
  id: string,
  fields: Record<string, unknown>,
  estadoLogico: EstadoMascota,
): Promise<MascotaTokenUpdateResult> {
  const schemaAttempts = [
    toModernDbEstado(estadoLogico),
    toLegacyDbEstado(estadoLogico),
  ];

  let lastResult: MascotaTokenUpdateResult | null = null;

  for (const estadoRow of schemaAttempts) {
    for (const includeWhatsapp of [true, false]) {
      const row = buildUpdateRow(fields, estadoRow, includeWhatsapp);
      const result = await supabase
        .from("mascotas_reportadas")
        .update(row)
        .eq("id", id)
        .select("token_edicion")
        .maybeSingle();

      if (!result.error) {
        return result;
      }

      lastResult = result;

      if (
        isMissingWhatsappColumnError(result.error.message) &&
        includeWhatsapp
      ) {
        continue;
      }

      if (!isMascotaEstadoConstraintError(result.error.message)) {
        return result;
      }

      break;
    }
  }

  return (
    lastResult ?? {
      data: null,
      error: { message: "No se pudo actualizar el reporte." },
    }
  );
}

export async function updateMascotaEstadoOnly(
  supabase: SupabaseClient,
  id: string,
  estadoLogico: EstadoMascota,
): Promise<MascotaTokenUpdateResult> {
  return updateMascotaReportada(supabase, id, {}, estadoLogico);
}
