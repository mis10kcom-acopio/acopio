import type { SupabaseClient } from "@supabase/supabase-js";
import type { EstadoMascota, TipoReporte } from "@/types/database";

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
  especie: string;
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  foto_url: string | null;
  token_edicion: string;
};

async function runInsert(
  supabase: SupabaseClient,
  payload: Record<string, unknown>,
) {
  return supabase.from("mascotas_reportadas").insert(payload);
}

export async function insertMascotaReportada(
  supabase: SupabaseClient,
  basePayload: MascotaInsertPayload,
  estadoLogico: EstadoMascota,
): Promise<{ error: string | null }> {
  const schemaAttempts = [toModernDbEstado(estadoLogico), toLegacyDbEstado(estadoLogico)];

  for (const estadoRow of schemaAttempts) {
    const withWhatsapp = { ...basePayload, ...estadoRow };
    let { error } = await runInsert(supabase, withWhatsapp);

    if (!error) {
      return { error: null };
    }

    if (
      isMissingWhatsappColumnError(error.message) &&
      withWhatsapp.contacto_whatsapp
    ) {
      const { contacto_whatsapp: _whatsapp, ...sinWhatsapp } = withWhatsapp;
      ({ error } = await runInsert(supabase, sinWhatsapp));

      if (!error) {
        return { error: null };
      }
    }

    if (!isMascotaEstadoConstraintError(error.message)) {
      return { error: error.message };
    }
  }

  return {
    error:
      "No se pudo guardar el estado del reporte. Ejecuta la migración SQL de estados en Supabase.",
  };
}

export async function updateMascotaReportada(
  supabase: SupabaseClient,
  id: string,
  fields: Record<string, unknown>,
  estadoLogico: EstadoMascota,
) {
  const modern = { ...fields, ...toModernDbEstado(estadoLogico) };
  let result = await supabase
    .from("mascotas_reportadas")
    .update(modern)
    .eq("id", id)
    .select("token_edicion")
    .maybeSingle();

  if (
    result.error &&
    isMascotaEstadoConstraintError(result.error.message)
  ) {
    result = await supabase
      .from("mascotas_reportadas")
      .update({ ...fields, ...toLegacyDbEstado(estadoLogico) })
      .eq("id", id)
      .select("token_edicion")
      .maybeSingle();
  }

  return result;
}

export async function updateMascotaEstadoOnly(
  supabase: SupabaseClient,
  id: string,
  estadoLogico: EstadoMascota,
) {
  return updateMascotaReportada(supabase, id, {}, estadoLogico);
}
